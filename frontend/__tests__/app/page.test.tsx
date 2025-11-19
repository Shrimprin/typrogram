import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import Home from '@/app/page';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // テストではnext/imageの最適化は不要なため、eslintの警告を無効化
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

describe('Home', () => {
  beforeEach(() => {
    render(<Home />);
  });

  describe('Hero section', () => {
    it('renders the logo', () => {
      expect(screen.getByAltText('Typrogram Logo')).toBeInTheDocument();
    });

    it('renders the main title', () => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Practice Typing Through Real Code',
        }),
      ).toBeInTheDocument();
    });

    it('renders the subtitle', () => {
      expect(screen.getByText('Import code from GitHub repository and practice typing it.')).toBeInTheDocument();
    });

    it('renders the GitHub sign-in button', () => {
      expect(screen.getByRole('button', { name: 'Sign in with GitHub to Start' })).toBeInTheDocument();
    });
  });

  describe('How to Use section', () => {
    it('renders the "How to Use Typrogram" section', () => {
      expect(screen.getByRole('heading', { level: 2, name: 'How to Use Typrogram' })).toBeInTheDocument();
    });

    it('renders the section description', () => {
      expect(
        screen.getByText('Get started with just 2 simple steps to improve your typing skills.'),
      ).toBeInTheDocument();
    });

    it('renders both step explanations', () => {
      expect(screen.getByRole('heading', { level: 3, name: 'Import GitHub Repository' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Start Typing Practice' })).toBeInTheDocument();
    });

    it('renders step videos with correct sources', () => {
      const video1 = screen.getByLabelText('Import GitHub Repository demonstration video');
      const video2 = screen.getByLabelText('Start Typing Practice demonstration video');

      expect(video1).toBeInTheDocument();
      expect(video2).toBeInTheDocument();

      const source1 = video1.querySelector('source');
      const source2 = video2.querySelector('source');

      expect(source1).toHaveAttribute('src', '/demo/step1_import-repository.mp4');
      expect(source2).toHaveAttribute('src', '/demo/step2_typing.mp4');
    });
  });
});
