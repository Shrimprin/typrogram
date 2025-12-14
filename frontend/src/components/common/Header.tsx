import { ChevronLeft, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import UserButton from '@/components/auth/UserButton';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type HeaderProps = {
  title?: string;
  moreComponent?: React.ReactNode;
  backHref?: string;
};

export default function Header({ title = '', moreComponent, backHref }: HeaderProps) {
  return (
    <header className="flex h-16 w-full flex-shrink-0 items-center overflow-hidden border-b bg-background px-8">
      <Link
        href="/"
        className={`
          flex-shrink-0 text-xl font-bold transition-opacity
          hover:opacity-80
        `}
      >
        <Image src="/logo-icon.svg" alt="Typrogram Logo" width={40} height={40} />
      </Link>
      <div className="mx-2 flex-shrink-0">
        {backHref ? (
          <Link href={backHref}>
            <Button variant="ghost" size="icon" aria-label="back">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
        ) : (
          <div className="h-9 w-9" />
        )}
      </div>
      {title && <h1 className="min-w-0 truncate text-lg font-bold">{title}</h1>}
      {moreComponent && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="more-menu" className="mx-2 flex-shrink-0">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>{moreComponent}</DropdownMenuContent>
        </DropdownMenu>
      )}
      <div className="ml-auto flex flex-shrink-0 gap-3 pl-3">
        <UserButton />
      </div>
    </header>
  );
}
