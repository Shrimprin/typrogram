import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';

import RepositoryDetailPage from '@/app/repositories/[id]/page';
import { clickButton } from '@test/helpers/interactions';
import { mockAuth, mockUseSession } from '@test/mocks/auth';

jest.mock('@/actions/toast', () => ({
  setToast: jest.fn().mockResolvedValue(undefined),
}));

describe('RepositoryDetailPage', () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const CORRECT_CHARS_SELECTOR = '[class*="bg-secondary"]';
  const INCORRECT_CHARS_SELECTOR = '[class*="bg-destructive"]';

  const mockFileItems = [
    {
      id: 1,
      name: 'file1.ts',
      type: 'file',
      status: 'untyped',
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
          status: 'typing',
          path: 'dir1/nested-file2.ts',
          fileItems: [],
        },
        {
          id: 6,
          name: 'japanese-file.ts',
          type: 'file',
          status: 'unsupported',
          path: 'dir1/japanese-file.ts',
          fileItems: [],
        },
      ],
    },
    {
      id: 7,
      name: 'dir2',
      type: 'dir',
      status: 'untyped',
      path: 'dir2',
      fileItems: [
        {
          id: 8,
          name: 'nested-file3.ts',
          type: 'file',
          status: 'untyped',
          path: 'dir2/nested-file3.ts',
          fileItems: [],
        },
      ],
    },
    {
      id: 9,
      name: 'file3.ts',
      type: 'file',
      status: 'untyped',
      path: 'file3.ts',
      fileItems: [],
    },
  ];

  const mockRepository = {
    data: {
      id: 1,
      name: 'test-repo',
      lastTypedAt: null,
      fileItems: mockFileItems,
    },
  };

  const mockFileItem = {
    data: {
      id: 4,
      name: 'nested-file1.ts',
      type: 'file',
      status: 'untyped',
      content: 'console.log("Hello, world!");',
      path: 'dir1/nested-file1.ts',
      fileItems: [],
    },
  };

  const mockUnsupportedFileItem = {
    data: {
      id: 6,
      name: 'japanese-file.ts',
      type: 'file',
      status: 'unsupported',
      content: 'console.log("こんにちは、世界！");',
      path: 'dir1/japanese-file.ts',
      fileItems: [],
    },
  };

  const mockUpdatedFileItem = {
    ...mockFileItem.data,
    status: 'typing',
  };

  const mockCompleteFileItem = {
    ...mockFileItem.data,
    status: 'typed',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockAuth();
    mockUseSession();
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    jest.spyOn(axios, 'get').mockImplementation((url) => {
      if (url.includes('/file_items/6')) {
        return Promise.resolve(mockUnsupportedFileItem);
      } else if (url.includes('/file_items/')) {
        return Promise.resolve(mockFileItem);
      }
      return Promise.resolve(mockRepository);
    });
    const repositoryDetailPage = await RepositoryDetailPage({ params: Promise.resolve({ id: '1' }) });
    render(repositoryDetailPage);
  });

  describe('initial state', () => {
    it('renders file tree with directories, files order both in alphabetical order', async () => {
      expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/api/repositories/1`, {
        headers: {
          Authorization: 'Bearer token_1234567890',
          'Content-Type': 'application/json',
        },
      });

      const fileTreeItems = screen.getByTestId('file-tree').querySelectorAll('button');
      expect(fileTreeItems).toHaveLength(5);

      expect(fileTreeItems[0].textContent).toContain('dir1');
      expect(fileTreeItems[1].textContent).toContain('dir2');

      expect(fileTreeItems[2].textContent).toContain('file1.ts');
      expect(fileTreeItems[3].textContent).toContain('file2.ts');
      expect(fileTreeItems[4].textContent).toContain('file3.ts');

      expect(screen.queryByRole('button', { name: 'nested-file1.txt' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'nested-file2.txt' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'nested-file3.txt' })).not.toBeInTheDocument();
    });

    it('renders typing area with explanatory message', async () => {
      expect(screen.getByText('Select a file to start typing.')).toBeInTheDocument();
    });
  });

  describe('when directory is clicked', () => {
    it('renders children of directory', async () => {
      await clickButton('dir1');

      expect(screen.getByRole('button', { name: 'nested-file1.ts' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'nested-file2.ts' })).toBeInTheDocument();
    });
  });

  describe('when file is clicked', () => {
    it('calls api to get file item', async () => {
      await clickButton('dir1');
      await clickButton('nested-file1.ts');

      expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/api/repositories/1/file_items/4`, {
        headers: {
          Authorization: 'Bearer token_1234567890',
          'Content-Type': 'application/json',
        },
      });
    });

    it('renders full path, play button and file content', async () => {
      await clickButton('dir1');
      await clickButton('nested-file1.ts');

      expect(screen.getByText('dir1/nested-file1.ts')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'PLAY' })).toBeInTheDocument();
      expect(screen.getByText('console.log("Hello, world!");')).toBeInTheDocument();
    });

    it('renders unsupported file message and does not render play button when file status is unsupported', async () => {
      await clickButton('dir1');
      await clickButton('japanese-file.ts');

      expect(screen.getByText('This file contains non-English characters, so it cannot be typed.')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'PLAY' })).not.toBeInTheDocument();
    });

    it('does not render highlight text', async () => {
      await clickButton('dir1');
      await clickButton('nested-file1.ts');

      const correctChars = document.querySelectorAll(CORRECT_CHARS_SELECTOR);
      const incorrectChars = document.querySelectorAll(INCORRECT_CHARS_SELECTOR);
      expect(correctChars).toHaveLength(0);
      expect(incorrectChars).toHaveLength(0);
    });
  });

  describe('during typing', () => {
    beforeEach(async () => {
      await clickButton('dir1');
      await clickButton('nested-file1.ts');
      await clickButton('PLAY');
    });

    it('hides play button and render pause button and reset button', async () => {
      expect(screen.queryByRole('button', { name: 'PLAY' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'PAUSE' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'RESET' })).toBeInTheDocument();
    });

    it('renders green highlighted text when type correct characters', async () => {
      await userEvent.keyboard('console');

      const correctChars = document.querySelectorAll(CORRECT_CHARS_SELECTOR);
      expect(correctChars).toHaveLength(7);

      const typedText = Array.from(correctChars)
        .map((span) => span.textContent)
        .join('');
      expect(typedText).toBe('console');
    });

    it('renders red highlighted text when type incorrect character', async () => {
      await userEvent.keyboard('d');

      const incorrectChars = document.querySelectorAll(INCORRECT_CHARS_SELECTOR);
      expect(incorrectChars).toHaveLength(1);
      expect(incorrectChars[0].textContent).toBe('c');
    });

    it('deletes typed character when type backspace key', async () => {
      await userEvent.keyboard('con');
      await userEvent.keyboard('{Backspace}');

      const correctChars = document.querySelectorAll(CORRECT_CHARS_SELECTOR);
      expect(correctChars).toHaveLength(2);

      const typedText = Array.from(correctChars)
        .map((span) => span.textContent)
        .join('');
      expect(typedText).toBe('co');
    });

    it('resets typing when RESET button is clicked', async () => {
      await userEvent.keyboard('con');

      await clickButton('RESET');

      expect(screen.getByRole('button', { name: 'PLAY' })).toBeInTheDocument();
      const correctChars = document.querySelectorAll(CORRECT_CHARS_SELECTOR);
      expect(correctChars).toHaveLength(0);
    });
  });

  describe('during pausing', () => {
    beforeEach(async () => {
      jest.spyOn(axios, 'patch').mockImplementation(() => {
        return Promise.resolve({
          data: {
            id: '1',
            name: 'test-repo',
            lastTypedAt: new Date().toISOString(),
            progress: 0.3,
            fileItems: [mockUpdatedFileItem],
          },
        });
      });

      await clickButton('dir1');
      await clickButton('nested-file1.ts');
      await clickButton('PLAY');
      await userEvent.keyboard('consoel');
      await clickButton('PAUSE');
    });

    it('renders correct and incorrect characters', async () => {
      const correctChars = document.querySelectorAll(CORRECT_CHARS_SELECTOR);
      const incorrectChars = document.querySelectorAll(INCORRECT_CHARS_SELECTOR);
      expect(correctChars).toHaveLength(5);
      expect(incorrectChars).toHaveLength(2);
    });

    it('renders resume button', async () => {
      expect(screen.getByRole('button', { name: 'RESUME' })).toBeInTheDocument();
    });

    it('can not type', async () => {
      await userEvent.keyboard('.log');

      const afterPausedCorrectChars = document.querySelectorAll(CORRECT_CHARS_SELECTOR);
      const afterPausedIncorrectChars = document.querySelectorAll(INCORRECT_CHARS_SELECTOR);
      expect(afterPausedCorrectChars).toHaveLength(5);
      expect(afterPausedIncorrectChars).toHaveLength(2);
    });

    it('resumes typing when RESUME button is clicked', async () => {
      await clickButton('RESUME');
      await userEvent.keyboard('.log');

      const correctChars = document.querySelectorAll(CORRECT_CHARS_SELECTOR);
      const incorrectChars = document.querySelectorAll(INCORRECT_CHARS_SELECTOR);
      expect(correctChars).toHaveLength(9);
      expect(incorrectChars).toHaveLength(2);
    });

    it('restore typing progress when switch file', async () => {
      jest.spyOn(axios, 'get').mockResolvedValueOnce({
        data: {
          id: 5,
          name: 'nested-file2.ts',
          type: 'file',
          status: 'typing',
          content: 'console.log("Hello, world!");',
          path: 'dir1/nested-file2.ts',
          typingProgress: {
            row: 0,
            column: 7,
            time: 100.5,
            totalTypoCount: 2,
            typos: [
              { row: 0, column: 5, character: 'e' },
              { row: 0, column: 6, character: 'l' },
            ],
          },
        },
      });

      await clickButton('nested-file2.ts');

      expect(screen.getByText('dir1/nested-file2.ts')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'RESUME' })).toBeInTheDocument();

      const correctChars = document.querySelectorAll(CORRECT_CHARS_SELECTOR);
      const incorrectChars = document.querySelectorAll(INCORRECT_CHARS_SELECTOR);
      expect(correctChars).toHaveLength(5);
      expect(incorrectChars).toHaveLength(2);
    });
  });

  describe('when completed', () => {
    beforeEach(async () => {
      Element.prototype.scrollTo = jest.fn();

      jest.spyOn(axios, 'patch').mockImplementation(() => {
        return Promise.resolve({
          data: {
            ...mockRepository.data,
            lastTypedAt: new Date().toISOString(),
            progress: 0.33,
            fileItems: [mockCompleteFileItem],
          },
        });
      });

      await clickButton('dir1');
      await clickButton('nested-file1.ts');
      await clickButton('PLAY');
      await userEvent.keyboard('console.log("Hello, sekai!");'); // world->sekaiにタイポ
      await screen.findByText('Results');
    });

    it('renders results', async () => {
      expect(screen.getByText('Results')).toBeInTheDocument();

      expect(screen.getByText('WPM')).toBeInTheDocument();
      expect(screen.getByText('0.0')).toBeInTheDocument(); // 時間は計測しないため0.0

      expect(screen.getByText('Accuracy')).toBeInTheDocument();
      expect(screen.getByText('82.8 %')).toBeInTheDocument();

      expect(screen.getByText('Characters')).toBeInTheDocument();
      expect(screen.getByText('29')).toBeInTheDocument();

      expect(screen.getByText('Typos')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();

      expect(screen.getByText('Time')).toBeInTheDocument();
      expect(screen.getByText('00:00')).toBeInTheDocument(); // 時間は計測しないため00:00

      expect(screen.getByText('Typed Code')).toBeInTheDocument();

      const correctChars = document.querySelectorAll(CORRECT_CHARS_SELECTOR);
      expect(correctChars).toHaveLength(24);
      const typedText = Array.from(correctChars)
        .map((span) => span.textContent)
        .join('');
      expect(typedText).toBe('console.log("Hello, !");');

      const typoChars = document.querySelectorAll(INCORRECT_CHARS_SELECTOR);
      expect(typoChars).toHaveLength(5);
      const typoText = Array.from(typoChars)
        .map((span) => span.textContent)
        .join('');
      expect(typoText).toBe('world');
    });

    it('calls api to update file item', async () => {
      expect(axios.patch).toHaveBeenCalledWith(
        `${BASE_URL}/api/repositories/1/file_items/4`,
        {
          fileItem: {
            status: 'typed',
            typingProgress: {
              row: 0,
              column: 28,
              elapsedSeconds: 0,
              totalCorrectTypeCount: 24,
              totalTypoCount: 5,
              typos: [
                {
                  row: 0,
                  column: 20,
                  character: 's',
                },
                {
                  row: 0,
                  column: 21,
                  character: 'e',
                },
                {
                  row: 0,
                  column: 22,
                  character: 'k',
                },
                {
                  row: 0,
                  column: 23,
                  character: 'a',
                },
                {
                  row: 0,
                  column: 24,
                  character: 'i',
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

    it('renders replay button', async () => {
      expect(screen.getByRole('button', { name: 'REPLAY' })).toBeInTheDocument();
    });

    it('replays typing when REPLAY button is clicked', async () => {
      await clickButton('REPLAY');
      expect(screen.getByRole('button', { name: 'PLAY' })).toBeInTheDocument();
    });
  });

  describe('when repository progress is 100%', () => {
    beforeEach(async () => {
      Element.prototype.scrollTo = jest.fn();

      jest.spyOn(axios, 'patch').mockImplementation(() => {
        return Promise.resolve({
          data: {
            ...mockRepository.data,
            lastTypedAt: new Date().toISOString(),
            progress: 1.0,
            fileItems: [mockCompleteFileItem],
          },
        });
      });

      await clickButton('file1.ts');
      await clickButton('PLAY');
      await userEvent.keyboard('console.log("Hello, world!");');
      await screen.findByText('Results');
    });

    it('shows congratulation modal when repository progress reaches 100%', async () => {
      expect(screen.getByText('CONGRATULATIONS')).toBeInTheDocument();
      expect(screen.getByText('All files have been typed in this repository.')).toBeInTheDocument();
    });
  });

  describe('when delete repository button is clicked', () => {
    it('calls api and navigates when confirmed', async () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
      jest.spyOn(axios, 'delete').mockResolvedValueOnce({ message: 'Repository deleted successfully' });
      jest.spyOn(window, 'confirm').mockReturnValueOnce(true);

      await userEvent.click(screen.getByLabelText('more-menu'));
      await userEvent.click(screen.getByText('Delete Repository'));

      expect(axios.delete).toHaveBeenCalledWith(`${BASE_URL}/api/repositories/1`, {
        headers: {
          Authorization: 'Bearer token_1234567890',
          'Content-Type': 'application/json',
        },
      });

      expect(mockPush).toHaveBeenCalledWith('/repositories');
    });

    it('does not call api and navigate when canceled', async () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
      jest.spyOn(window, 'confirm').mockReturnValueOnce(false);

      await userEvent.click(screen.getByLabelText('more-menu'));
      await userEvent.click(screen.getByText('Delete Repository'));

      expect(mockPush).not.toHaveBeenCalledWith('/repositories');
    });
  });
});
