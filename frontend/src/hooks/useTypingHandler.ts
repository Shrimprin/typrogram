import type { FileItem, Repository, Stats, TypingStatus, Typo } from '@/types';

import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';

import { axiosPatch } from '@/utils/axios';
import { extractErrorMessage } from '@/utils/error-handler';
import { fetcher } from '@/utils/fetcher';
import { updateFileItemInTree } from '@/utils/file-item';
import { sortFileItems } from '@/utils/sort';
import { toast } from 'sonner';
import { useTypingStats } from './useTypingStats';

type useTypingHandlerProps = {
  typingStatus: TypingStatus;
  fileItem?: FileItem;
  onRepositoryCompleted?: () => void;
  setFileItems: Dispatch<SetStateAction<FileItem[]>>;
  setTypingStatus: (status: TypingStatus) => void;
};

type HandleInputResult = {
  newTypedTextLines: string[];
  newCursorColumns: number[];
  newCursorRow: number;
  isCorrect?: boolean;
};

export function useTypingHandler({
  typingStatus,
  fileItem,
  onRepositoryCompleted,
  setFileItems,
  setTypingStatus,
}: useTypingHandlerProps) {
  const [targetTextLines, setTargetTextLines] = useState<string[]>([]);
  const [cursorColumns, setCursorColumns] = useState<number[]>([]);
  const [typedTextLines, setTypedTextLines] = useState<string[]>([]);
  const [cursorRow, setCursorRow] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: session } = useSession();
  const params = useParams();
  const typingStats = useTypingStats();

  const setupTypingState = async (fileItemId: number): Promise<FileItem | null> => {
    setErrorMessage(null);

    try {
      const url = `/api/repositories/${params.id}/file_items/${fileItemId}`;
      const accessToken = session?.user?.accessToken;
      const fetchedFileItem: FileItem = await fetcher(url, accessToken);

      const { textLines, initialCursorColumns, initialTypedTextLines } = initializeTextState(
        fetchedFileItem.content || '',
      );
      setTargetTextLines(textLines);

      if (!fetchedFileItem.typingProgress) {
        setCursorColumns(initialCursorColumns);
        setTypedTextLines(initialTypedTextLines);
        setCursorRow(0);
        typingStats.resetStats();
        return fetchedFileItem;
      }

      const { row: currentRow, column: currentColumn, typos = [] } = fetchedFileItem.typingProgress;

      let { restoredCursorColumns, restoredTypedTextLines } = restoreCompletedRows(
        currentRow,
        textLines,
        typos,
        initialCursorColumns,
      );

      ({ restoredCursorColumns, restoredTypedTextLines } = restoreCurrentRow(
        currentRow,
        currentColumn,
        textLines,
        typos,
        restoredCursorColumns,
        restoredTypedTextLines,
      ));

      setCursorColumns(restoredCursorColumns);
      setTypedTextLines(restoredTypedTextLines);
      setCursorRow(currentRow);

      const { accuracy, elapsedSeconds, totalCorrectTypeCount, totalTypoCount, wpm } = fetchedFileItem.typingProgress;
      typingStats.restoreStats(accuracy, elapsedSeconds, totalCorrectTypeCount, totalTypoCount, wpm);

      return fetchedFileItem;
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      return null;
    }
  };

  const startTyping = () => {
    typingStats.startStats();
    setTypingStatus('typing');
  };

  const pauseTyping = async () => {
    try {
      typingStats.pauseStats();

      const url = `/api/repositories/${params.id}/file_items/${fileItem?.id}`;
      const accessToken = session?.user?.accessToken;
      const postData = {
        fileItem: {
          status: 'typing',
          typingProgress: {
            row: cursorRow,
            column: cursorColumns[cursorRow],
            elapsedSeconds: typingStats.elapsedSeconds,
            totalCorrectTypeCount: typingStats.totalCorrectTypeCount,
            totalTypoCount: typingStats.totalTypoCount,
            typos: calculateTypos(typedTextLines, targetTextLines),
          },
        },
      };

      const response = await axiosPatch(url, accessToken, postData);
      setFileItems((prev) => updateFileItemInTree(prev, response.data));
      setTypingStatus('paused');
      toast.success('Typing paused and progress saved.');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
    }
  };

  const resumeTyping = () => {
    typingStats.resumeStats();
    setTypingStatus('typing');
  };

  const resetTyping = () => {
    const initialCursorColumns = targetTextLines.map((line) => line.indexOf(line.trimStart()));
    const initialTypedTextLines = targetTextLines.map((_, index) => ' '.repeat(initialCursorColumns[index]));
    setCursorColumns(initialCursorColumns);
    setTypedTextLines(initialTypedTextLines);
    setCursorRow(0);
    typingStats.resetStats();
    setTypingStatus('ready');
    toast.success('Reset progress.');
  };

  const handleComplete = useCallback(
    async (isLastTypeCorrect: boolean) => {
      try {
        typingStats.completeStats();

        const url = `/api/repositories/${params.id}/file_items/${fileItem?.id}`;
        const accessToken = session?.user?.accessToken;
        const postData = {
          fileItem: {
            status: 'typed',
            typingProgress: {
              row: cursorRow,
              column: cursorColumns[cursorRow],
              elapsedSeconds: typingStats.elapsedSeconds,
              // typingStatsには最後のタイプの結果が反映されていないため、ここで加算する
              totalCorrectTypeCount: typingStats.totalCorrectTypeCount + (isLastTypeCorrect ? 1 : 0),
              totalTypoCount: typingStats.totalTypoCount + (isLastTypeCorrect ? 0 : 1),
              typos: calculateTypos(typedTextLines, targetTextLines),
            },
          },
        };

        const res = await axiosPatch(url, accessToken, postData);
        const repository: Repository = res.data;
        const sortedFileItems: FileItem[] = sortFileItems(repository.fileItems);
        setFileItems(sortedFileItems);

        if (repository.progress === 1.0 && onRepositoryCompleted) {
          onRepositoryCompleted();
        }

        setTypingStatus('completed');
      } catch (error) {
        setErrorMessage(extractErrorMessage(error));
      }
    },
    [
      fileItem?.id,
      params,
      session,
      cursorRow,
      cursorColumns,
      typedTextLines,
      targetTextLines,
      typingStats,
      setFileItems,
      setTypingStatus,
      onRepositoryCompleted,
    ],
  );

  const isComplete = useCallback(
    (newCursorColumns: number[]) => {
      return (
        cursorRow === targetTextLines.length - 1 && newCursorColumns[cursorRow] === targetTextLines[cursorRow].length
      );
    },
    [cursorRow, targetTextLines],
  );

  const handleCharacterInput = useCallback(
    (character: string) => {
      const newTypedTextLines = [...typedTextLines];
      const newCursorColumns = [...cursorColumns];

      newTypedTextLines[cursorRow] += character;
      newCursorColumns[cursorRow] = Math.min(targetTextLines[cursorRow].length, cursorColumns[cursorRow] + 1);
      const newCursorRow =
        newCursorColumns[cursorRow] === targetTextLines[cursorRow].length
          ? Math.min(targetTextLines.length - 1, cursorRow + 1)
          : cursorRow;

      const targetChar = targetTextLines[cursorRow]?.[cursorColumns[cursorRow]];
      const isCorrect = targetChar === character;

      return { newTypedTextLines, newCursorColumns, newCursorRow, isCorrect };
    },
    [typedTextLines, cursorColumns, cursorRow, targetTextLines],
  );

  const handleBackspace = useCallback(() => {
    const newTypedTextLines = [...typedTextLines];
    const newCursorColumns = [...cursorColumns];
    const backspacedCursorColumn = cursorColumns[cursorRow] - 1;
    const newCursorRow = backspacedCursorColumn < 0 ? Math.max(0, cursorRow - 1) : cursorRow;

    // 最初の行かつ最初の文字の場合は何もしない
    if (cursorRow === 0 && backspacedCursorColumn < 0) {
      return { newTypedTextLines, newCursorColumns, newCursorRow };
    }

    newTypedTextLines[newCursorRow] = typedTextLines[newCursorRow].slice(0, -1);
    newCursorColumns[newCursorRow] =
      backspacedCursorColumn < 0 ? newCursorColumns[newCursorRow] - 1 : backspacedCursorColumn;

    return { newTypedTextLines, newCursorColumns, newCursorRow };
  }, [typedTextLines, cursorColumns, cursorRow]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (typingStatus !== 'typing') return;

      let result: HandleInputResult = {
        newTypedTextLines: [],
        newCursorColumns: [],
        newCursorRow: 0,
      };

      if (e.key.length === 1) {
        if (e.key === ' ') {
          e.preventDefault();
        }
        result = handleCharacterInput(e.key);
      } else if (e.key === 'Enter') {
        result = handleCharacterInput('\n');
      } else if (e.key === 'Backspace') {
        result = handleBackspace();
      } else {
        e.preventDefault();
        return;
      }

      setTypedTextLines(result.newTypedTextLines);
      setCursorColumns(result.newCursorColumns);
      setCursorRow(result.newCursorRow);

      if (result.isCorrect !== undefined) {
        typingStats.updateStats(result.isCorrect);
      }

      if (isComplete(result.newCursorColumns)) {
        handleComplete(result.isCorrect ?? true);
      }
    },
    [typingStatus, handleCharacterInput, handleBackspace, isComplete, handleComplete, typingStats],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const stats: Stats = {
    accuracy: typingStats.accuracy,
    elapsedSeconds: typingStats.elapsedSeconds,
    totalCorrectTypeCount: typingStats.totalCorrectTypeCount,
    totalTypoCount: typingStats.totalTypoCount,
    wpm: typingStats.wpm,
  };

  return {
    cursorRow,
    cursorColumns,
    targetTextLines,
    typedTextLines,
    typingStatus,
    errorMessage,
    stats,
    startTyping,
    resumeTyping,
    pauseTyping,
    resetTyping,
    setupTypingState,
  };
}

function calculateTypos(typedTextLines: string[], targetTextLines: string[]): Typo[] {
  return typedTextLines.flatMap((typedTextLine, row) => {
    const targetTextLine = targetTextLines[row] || '';
    return [...typedTextLine]
      .map((typedChar, column) => ({ typedChar, column, targetChar: targetTextLine[column] }))
      .filter(({ typedChar, targetChar }) => typedChar !== targetChar)
      .map(({ typedChar, column }) => ({
        row,
        column,
        character: typedChar,
      }));
  });
}

function initializeTextState(content: string) {
  const textLines = content?.split(/(?<=\n)/) || [];
  const initialCursorColumns = textLines.map((textLine) => textLine.indexOf(textLine.trimStart()));
  const initialTypedTextLines = textLines.map((_, row) => ' '.repeat(initialCursorColumns[row]));

  return {
    textLines,
    initialCursorColumns,
    initialTypedTextLines,
  };
}

function restoreCompletedRows(currentRow: number, textLines: string[], typos: Typo[], initialCursorColumns: number[]) {
  const restoredCursorColumns = [...initialCursorColumns];
  const restoredTypedTextLines = textLines.map((_, row) => ' '.repeat(initialCursorColumns[row]));

  textLines.slice(0, currentRow).forEach((textLine, row) => {
    restoredTypedTextLines[row] = restoreTypedTextLine(row, textLine, typos);
    restoredCursorColumns[row] = textLine.length;
  });

  return { restoredCursorColumns, restoredTypedTextLines };
}

function restoreCurrentRow(
  currentRow: number,
  currentColumn: number,
  textLines: string[],
  typos: Typo[],
  restoredCursorColumns: number[],
  restoredTypedTextLines: string[],
) {
  const currentTextLine = textLines[currentRow];
  const currentTargetText = currentTextLine.substring(0, currentColumn);
  restoredTypedTextLines[currentRow] = restoreTypedTextLine(currentRow, currentTargetText, typos);
  restoredCursorColumns[currentRow] = currentColumn;

  return { restoredCursorColumns, restoredTypedTextLines };
}

function restoreTypedTextLine(row: number, targetTextLine: string, typos: Typo[]): string {
  const typoMap = new Map(typos.filter((typo) => typo.row === row).map((typo) => [typo.column, typo.character]));

  return [...targetTextLine].map((char, index) => typoMap.get(index) ?? char).join('');
}
