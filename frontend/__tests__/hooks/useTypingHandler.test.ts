import type { FileItem, TypingStatus } from '@/types';

import { act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';

import { useTypingHandler } from '@/hooks/useTypingHandler';
import { sortFileItems } from '@/utils/sort';
import { useParams } from 'next/navigation';
import { mockAuth, mockUseSession } from '../mocks/auth';

jest.mock('@/utils/sort', () => ({
  sortFileItems: jest.fn(),
}));

describe('useTypingHandler', () => {
  const mockFileItemData = {
    id: 1,
    content: "def hello_world\n  puts 'Hello, World!'\nend\n",
    path: 'test-file-path',
    name: 'test-file-name',
    status: 'untyped',
    type: 'file',
    fileItems: [],
  };

  const mockSetFileItems = jest.fn();
  const mockSetTypingStatus = jest.fn();

  const defaultProps = {
    typingStatus: 'ready' as TypingStatus,
    fileItem: {
      id: 1,
      path: 'test-file-path',
      name: 'test-file-name',
      status: 'untyped',
      type: 'file',
      fileItems: [],
    } as FileItem,
    setFileItems: mockSetFileItems,
    setTypingStatus: mockSetTypingStatus,
  };

  const setupHook = async (props = defaultProps) => {
    const { result } = renderHook(() => useTypingHandler(props));
    await act(async () => {
      await result.current.setupTypingState(1);
      result.current.startTyping();
    });

    return result;
  };

  const typeEntireContent = async () => {
    await userEvent.keyboard('def hello_world{Enter}');
    await userEvent.keyboard("pust 'Hello, World!'{Enter}"); // タイポを含む
    await userEvent.keyboard('end{Enter}');
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth();
    mockUseSession();
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    jest.spyOn(axios, 'get').mockResolvedValue({ data: mockFileItemData });
  });

  describe('initial state', () => {
    it('has typing status is ready', () => {
      const { result } = renderHook(() => useTypingHandler(defaultProps));

      expect(result.current.typingStatus).toBe('ready');
    });

    it('has leading spaces are typed', async () => {
      const result = await setupHook();

      expect(result.current.typedTextLines).toEqual(['', '  ', '']);
      expect(result.current.cursorColumns).toEqual([0, 2, 0]);
    });

    it('start with cursor line is first', async () => {
      const result = await setupHook();

      expect(result.current.cursorRow).toBe(0);
    });

    it('can not type when key is pressed', async () => {
      const result = await setupHook();

      await userEvent.keyboard('A');

      expect(result.current.typedTextLines).toEqual(['', '  ', '']);
      expect(result.current.cursorColumns).toEqual([0, 2, 0]);
      expect(result.current.cursorRow).toBe(0);
    });

    it('can start typing', () => {
      const { result } = renderHook(() => useTypingHandler(defaultProps));

      act(() => {
        result.current.startTyping();
      });

      expect(mockSetTypingStatus).toHaveBeenCalledWith('typing');
    });
  });

  describe('During typing', () => {
    const typingProps = {
      ...defaultProps,
      typingStatus: 'typing' as TypingStatus,
    };
    it('can type the key', async () => {
      const result = await setupHook(typingProps);

      await userEvent.keyboard('d');

      expect(result.current.typedTextLines).toEqual(['d', '  ', '']);
      expect(result.current.cursorColumns).toEqual([1, 2, 0]);
    });

    it('can type the enter key', async () => {
      const result = await setupHook(typingProps);

      await userEvent.keyboard('{Enter}');

      expect(result.current.typedTextLines).toEqual(['\n', '  ', '']);
      expect(result.current.cursorColumns).toEqual([1, 2, 0]);
    });

    it('can line break with the enter key', async () => {
      const result = await setupHook(typingProps);

      await userEvent.keyboard('def hello_world');

      expect(result.current.typedTextLines).toEqual(['def hello_world', '  ', '']);
      expect(result.current.cursorColumns).toEqual([15, 2, 0]);
      expect(result.current.cursorRow).toBe(0);

      await userEvent.keyboard('{Enter}');

      expect(result.current.typedTextLines).toEqual(['def hello_world\n', '  ', '']);
      expect(result.current.cursorColumns).toEqual([16, 2, 0]);
      expect(result.current.cursorRow).toBe(1);
    });

    it('can delete the input with the backspace key', async () => {
      const result = await setupHook(typingProps);

      await userEvent.keyboard('d');

      expect(result.current.typedTextLines).toEqual(['d', '  ', '']);
      expect(result.current.cursorColumns).toEqual([1, 2, 0]);

      await userEvent.keyboard('{Backspace}');

      expect(result.current.typedTextLines).toEqual(['', '  ', '']);
      expect(result.current.cursorColumns).toEqual([0, 2, 0]);
    });

    it('can delete the line break with the backspace key', async () => {
      const result = await setupHook(typingProps);

      await userEvent.keyboard('def hello_world{Enter}');

      expect(result.current.typedTextLines).toEqual(['def hello_world\n', '  ', '']);
      expect(result.current.cursorColumns).toEqual([16, 2, 0]);
      expect(result.current.cursorRow).toBe(1);

      // スペースがあるため3回バックスペースキーを入力する
      await userEvent.keyboard('{Backspace}{Backspace}{Backspace}');

      expect(result.current.typedTextLines).toEqual(['def hello_world', '', '']);
      expect(result.current.cursorColumns).toEqual([15, 0, 0]);
      expect(result.current.cursorRow).toBe(0);
    });

    it('cannot type the tab key', async () => {
      const result = await setupHook(typingProps);

      await userEvent.keyboard('{Tab}');

      expect(result.current.typedTextLines).toEqual(['', '  ', '']);
      expect(result.current.cursorColumns).toEqual([0, 2, 0]);
    });

    it('does not delete when first line and first character with backspace key', async () => {
      const result = await setupHook(typingProps);

      // カーソルが最初の行と最初の文字の位置にあることを確認
      expect(result.current.cursorRow).toBe(0);
      expect(result.current.cursorColumns[0]).toBe(0);

      await userEvent.keyboard('{Backspace}');

      expect(result.current.typedTextLines).toEqual(['', '  ', '']);
      expect(result.current.cursorColumns).toEqual([0, 2, 0]);
      expect(result.current.cursorRow).toBe(0);
    });

    it('can pause typing', async () => {
      jest.spyOn(axios, 'patch').mockResolvedValueOnce({
        data: {
          id: 1,
          path: 'test-file-path',
          name: 'test-file-name',
          status: 'typing',
          type: 'file',
          fileItems: [],
        },
      });

      const result = await setupHook(typingProps);

      await userEvent.keyboard('def hello_world{Enter}');
      await userEvent.keyboard("puts 'Hello, World!'{Enter}");

      expect(result.current.typedTextLines).toEqual(['def hello_world\n', "  puts 'Hello, World!'\n", '']);
      expect(result.current.cursorColumns).toEqual([16, 23, 0]);
      expect(result.current.cursorRow).toBe(2);

      await act(async () => {
        await result.current.pauseTyping();
      });

      expect(mockSetTypingStatus).toHaveBeenCalledWith('paused');
      expect(result.current.typedTextLines).toEqual(['def hello_world\n', "  puts 'Hello, World!'\n", '']);
      expect(result.current.cursorColumns).toEqual([16, 23, 0]);
      expect(result.current.cursorRow).toBe(2);
    });

    it('can complete typing', async () => {
      const mockResponse = {
        id: 1,
        name: 'test-repo',
        progress: 0.5,
        lastTypedAt: new Date().toISOString(),
        fileItems: [
          {
            id: '1',
            path: 'test-file-path',
            name: 'test-file-name',
            status: 'typed',
            type: 'file',
            fileItems: [],
          },
        ],
      };

      jest.spyOn(axios, 'patch').mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await setupHook(typingProps);

      await typeEntireContent();

      expect(mockSetTypingStatus).toHaveBeenCalledWith('completed');
      expect(result.current.typedTextLines).toEqual(['def hello_world\n', "  pust 'Hello, World!'\n", 'end\n']);
      expect(result.current.cursorColumns).toEqual([16, 23, 4]);
      expect(result.current.cursorRow).toBe(2);
    });

    it('can reset typing', async () => {
      const result = await setupHook(typingProps);

      await userEvent.keyboard('def hello_world{Enter}');

      expect(result.current.typedTextLines).toEqual(['def hello_world\n', '  ', '']);
      expect(result.current.cursorColumns).toEqual([16, 2, 0]);
      expect(result.current.cursorRow).toBe(1);
      expect(result.current.typingStatus).toBe('typing');

      act(() => {
        result.current.resetTyping();
      });

      expect(mockSetTypingStatus).toHaveBeenCalledWith('ready');
      expect(result.current.typedTextLines).toEqual(['', '  ', '']);
      expect(result.current.cursorColumns).toEqual([0, 2, 0]);
      expect(result.current.cursorRow).toBe(0);
    });
  });

  describe('During paused', () => {
    const pausedProps = {
      ...defaultProps,
      typingStatus: 'paused' as TypingStatus,
    };

    it('cannot type the key', async () => {
      const result = await setupHook(pausedProps);

      await userEvent.keyboard('d');

      expect(result.current.typedTextLines).toEqual(['', '  ', '']);
      expect(result.current.cursorColumns).toEqual([0, 2, 0]);
    });

    it('can resume typing', async () => {
      const { result } = renderHook(() => useTypingHandler(pausedProps));

      act(() => {
        result.current.resumeTyping();
      });

      expect(mockSetTypingStatus).toHaveBeenCalledWith('typing');
    });
  });

  describe('During completed', () => {
    const completedProps = {
      ...defaultProps,
      typingStatus: 'completed' as TypingStatus,
    };

    it('cannot type the key', async () => {
      const result = await setupHook(completedProps);

      await userEvent.keyboard('d');

      expect(result.current.typedTextLines).toEqual(['', '  ', '']);
      expect(result.current.cursorColumns).toEqual([0, 2, 0]);
    });

    it('can replay typing', async () => {
      const result = await setupHook(completedProps);

      act(() => {
        result.current.resetTyping();
      });

      expect(mockSetTypingStatus).toHaveBeenCalledWith('ready');
      expect(result.current.typedTextLines).toEqual(['', '  ', '']);
      expect(result.current.cursorColumns).toEqual([0, 2, 0]);
      expect(result.current.cursorRow).toBe(0);
    });
  });

  describe('setupTypingState', () => {
    beforeEach(() => {
      jest.spyOn(axios, 'get').mockResolvedValue({ data: mockFileItemData });
    });

    describe('when does not exist typing progress', () => {
      it('sets initial values', async () => {
        const result = await setupHook(defaultProps);

        expect(result.current.typedTextLines).toEqual(['', '  ', '']);
        expect(result.current.cursorColumns).toEqual([0, 2, 0]);
        expect(result.current.cursorRow).toBe(0);
      });
    });

    describe('when typing progress exists', () => {
      beforeEach(() => {
        const mockFileItemWithProgress = {
          ...mockFileItemData,
          typingProgress: {
            row: 1,
            column: 6,
            time: 100.5,
            totalTypoCount: 10,
            typos: [
              {
                row: 1,
                column: 4,
                character: 's',
              },
              {
                row: 1,
                column: 5,
                character: 't',
              },
            ],
          },
        };
        (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockFileItemWithProgress });
      });

      it('restores typing progress correctly', async () => {
        const result = await setupHook(defaultProps);

        expect(result.current.typedTextLines).toEqual(['def hello_world\n', '  pust', '']);
        expect(result.current.cursorColumns).toEqual([16, 6, 0]);
        expect(result.current.cursorRow).toBe(1);
      });
    });

    describe('when error occurs', () => {
      it('shows error message', async () => {
        jest.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Server Error'));
        const result = await setupHook(defaultProps);

        expect(result.current.errorMessage).toBe('Server Error');
      });
    });
  });

  describe('pauseTyping', () => {
    const typingProps = {
      ...defaultProps,
      typingStatus: 'typing' as TypingStatus,
    };

    describe('when success', () => {
      const mockResponse = {
        data: {
          id: 1,
          name: 'test-file-name',
          type: 'file',
          status: 'typing',
          path: 'test-file-path',
          fileItems: [],
        },
      };

      beforeEach(async () => {
        jest.spyOn(axios, 'patch').mockResolvedValueOnce(mockResponse);

        const result = await setupHook(typingProps);

        await userEvent.keyboard('def hello_world{Enter}');
        await userEvent.keyboard('pust');

        await act(async () => {
          await result.current.pauseTyping();
        });
      });

      it('calls api to update file item status to typing, and updates typing progress', async () => {
        const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

        expect(axios.patch).toHaveBeenCalledWith(
          `${BASE_URL}/api/repositories/1/file_items/1`,
          {
            fileItem: {
              status: 'typing',
              typingProgress: {
                row: 1,
                column: 6,
                elapsedSeconds: 0,
                totalCorrectTypeCount: 18,
                totalTypoCount: 2,
                typos: [
                  {
                    row: 1,
                    column: 4,
                    character: 's',
                  },
                  {
                    row: 1,
                    column: 5,
                    character: 't',
                  },
                ],
              },
            },
          },
          {
            headers: {
              Authorization: 'Bearer token_1234567890',
              'Content-Type': 'application/json',
            },
          },
        );
      });

      it('calls setFileItems once and updates file item', () => {
        expect(mockSetFileItems).toHaveBeenCalledTimes(1);

        const prevFileItems = [
          {
            id: 1,
            name: 'test-file-name',
            type: 'file',
            status: 'untyped',
            path: 'test-file-path',
            fileItems: [],
          },
          {
            id: 2,
            name: 'dir1',
            type: 'dir',
            status: 'untyped',
            path: 'dir1',
            fileItems: [
              {
                id: 3,
                name: 'nested-file.ts',
                type: 'file',
                status: 'untyped',
                path: 'dir1/nested-file.ts',
                fileItems: [],
              },
            ],
          },
        ] as FileItem[];

        const updateFunction = mockSetFileItems.mock.calls[0][0]; // (prev) => updateFileItemInTree(prev, response.data)が格納される
        const result = updateFunction(prevFileItems); // updateFileItemInTree(prevFileItems, updatedFileItem)が呼ばれる

        expect(result[0].status).toBe('typing');
        expect(result[1].fileItems?.[0].status).toBe('untyped');
      });

      it('updates typing status to paused', () => {
        expect(mockSetTypingStatus).toHaveBeenCalledWith('paused');
      });
    });

    describe('when error occurs', () => {
      it('shows error message', async () => {
        jest.spyOn(axios, 'patch').mockRejectedValueOnce(new Error('Server Error'));

        const result = await setupHook(typingProps);
        await typeEntireContent();

        expect(result.current.errorMessage).toBe('Server Error');
        expect(mockSetTypingStatus).not.toHaveBeenCalledWith('completed');
      });
    });
  });

  describe('handleComplete', () => {
    const typingProps = {
      ...defaultProps,
      typingStatus: 'typing' as TypingStatus,
    };

    describe('when success', () => {
      const mockResponse = [
        {
          id: 1,
          name: 'file1.ts',
          type: 'file',
          status: 'typed',
          path: 'file1.ts',
          fileItems: [],
        },
        {
          id: 2,
          name: 'file2.ts',
          type: 'file',
          status: 'typed',
          path: 'file2.ts',
          fileItems: [],
        },
        {
          id: 3,
          name: 'dir1',
          type: 'dir',
          status: 'untyped',
          path: 'dir1',
          fileItems: [
            {
              id: 4,
              name: 'nested-file1.ts',
              type: 'file',
              status: 'untyped',
              path: 'dir1/nested-file1.ts',
              fileItems: [],
            },
            {
              id: 5,
              name: 'nested-file2.ts',
              type: 'file',
              status: 'untyped',
              path: 'dir1/nested-file2.ts',
              fileItems: [],
            },
          ],
        },
        {
          id: 6,
          name: 'dir2',
          type: 'dir',
          status: 'untyped',
          path: 'dir2',
          fileItems: [
            {
              id: 7,
              name: 'nested-file3.ts',
              type: 'file',
              status: 'untyped',
              path: 'dir2/nested-file3.ts',
              fileItems: [],
            },
          ],
        },
        {
          id: 8,
          name: 'file3.ts',
          type: 'file',
          status: 'untyped',
          path: 'file3.ts',
          fileItems: [],
        },
      ];

      const sortedResponse = [
        {
          id: 3,
          name: 'dir1',
          type: 'dir',
          status: 'untyped',
          path: 'dir1',
          fileItems: [
            {
              id: 4,
              name: 'nested-file1.ts',
              type: 'file',
              status: 'untyped',
              path: 'dir1/nested-file1.ts',
              fileItems: [],
            },
            {
              id: 5,
              name: 'nested-file2.ts',
              type: 'file',
              status: 'untyped',
              path: 'dir1/nested-file2.ts',
              fileItems: [],
            },
          ],
        },
        {
          id: 6,
          name: 'dir2',
          type: 'dir',
          status: 'untyped',
          path: 'dir2',
          fileItems: [
            {
              id: 7,
              name: 'nested-file3.ts',
              type: 'file',
              status: 'untyped',
              path: 'dir2/nested-file3.ts',
              fileItems: [],
            },
          ],
        },
        {
          id: 1,
          name: 'file1.ts',
          type: 'file',
          status: 'typed',
          path: 'file1.ts',
          fileItems: [],
        },
        {
          id: 2,
          name: 'file2.ts',
          type: 'file',
          status: 'typed',
          path: 'file2.ts',
          fileItems: [],
        },
        {
          id: 8,
          name: 'file3.ts',
          type: 'file',
          status: 'untyped',
          path: 'file3.ts',
          fileItems: [],
        },
      ];

      beforeEach(async () => {
        jest.spyOn(axios, 'patch').mockResolvedValueOnce({
          data: {
            id: '1',
            name: 'test-repo',
            progress: 0.67,
            fileItems: mockResponse,
          },
        });
        (sortFileItems as jest.Mock).mockReturnValue(sortedResponse);

        await setupHook(typingProps);

        await typeEntireContent();
      });

      it('calls api to update file item status to typed, and updates typing progress', () => {
        const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

        expect(axios.patch).toHaveBeenCalledWith(
          `${BASE_URL}/api/repositories/1/file_items/1`,
          {
            fileItem: {
              status: 'typed',
              typingProgress: {
                row: 2,
                column: 3,
                elapsedSeconds: 0,
                totalCorrectTypeCount: 39,
                totalTypoCount: 2,
                typos: [
                  {
                    row: 1,
                    column: 4,
                    character: 's',
                  },
                  {
                    row: 1,
                    column: 5,
                    character: 't',
                  },
                ],
              },
            },
          },
          {
            headers: {
              Authorization: 'Bearer token_1234567890',
              'Content-Type': 'application/json',
            },
          },
        );
      });

      it('calls setFileItems with sorted file items', () => {
        expect(sortFileItems).toHaveBeenCalledWith(mockResponse);
        expect(mockSetFileItems).toHaveBeenCalledWith(sortedResponse);
      });

      it('updates typing status to completed', () => {
        expect(mockSetTypingStatus).toHaveBeenCalledWith('completed');
      });
    });

    describe('when error occurs', () => {
      it('shows error message', async () => {
        jest.spyOn(axios, 'patch').mockRejectedValueOnce(new Error('Server Error'));

        const result = await setupHook(typingProps);
        await typeEntireContent();

        expect(result.current.errorMessage).toBe('Server Error');
        expect(mockSetTypingStatus).not.toHaveBeenCalledWith('completed');
      });
    });
  });
});
