import { Github } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const startYear = 2025;
  const yearRange = currentYear === startYear ? startYear : `${startYear} - ${currentYear}`;

  return (
    <footer className="bg-background border-border mt-auto border-t">
      <div
        className={`
          container mx-auto px-4 py-4
          sm:px-6 sm:py-6
          md:px-8
        `}
      >
        <div
          className={`
            mb-3 flex flex-col items-center justify-center gap-3 text-sm
            sm:mb-4 sm:flex-row sm:gap-6
            md:gap-8
          `}
        >
          <Link
            href="/terms"
            className={`
              text-muted-foreground decoration-primary/50 text-center underline-offset-4 transition-colors duration-200
              hover:text-foreground hover:underline
            `}
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className={`
              text-muted-foreground decoration-primary/50 text-center underline-offset-4 transition-colors duration-200
              hover:text-foreground hover:underline
            `}
          >
            Privacy Policy
          </Link>
          <Link
            href="https://github.com/Shrimprin/typrogram"
            target="_blank"
            rel="noopener noreferrer"
            className={`
              text-muted-foreground decoration-primary/50 flex items-center justify-center gap-2 text-center
              underline-offset-4 transition-colors duration-200
              hover:text-foreground hover:underline
            `}
          >
            <Github className="h-4 w-4" />
            GitHub
          </Link>
        </div>

        <div className="text-center">
          <span
            className={`
              text-muted-foreground text-xs
              sm:text-sm
            `}
          >
            {yearRange} Typrogram. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
