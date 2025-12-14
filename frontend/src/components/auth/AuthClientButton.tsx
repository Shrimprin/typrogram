'use client';

import { Github, LoaderCircle, LogOut } from 'lucide-react';
import React from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { cn } from '@/libs/shadcn/utils';

export function SignInSubmitButton({ children, large }: { children?: React.ReactNode; large?: boolean }) {
  const { pending } = useFormStatus();
  const iconSize = large ? 'h-6 w-6' : 'h-5 w-5';
  return (
    <Button
      type="submit"
      variant="primary"
      size="lg"
      className={cn('flex items-center gap-2', large && 'h-12 px-8 py-4 text-lg')}
      disabled={pending}
    >
      {pending ? (
        <LoaderCircle className={cn(iconSize, 'flex-shrink-0 animate-spin')} />
      ) : (
        <Github className={cn(iconSize, 'flex-shrink-0')} />
      )}
      {children || 'Sign in'}
    </Button>
  );
}

export function SignOutSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`
        flex w-full items-center gap-2 px-2 py-1.5 text-sm
        hover:bg-accent
        disabled:cursor-not-allowed disabled:opacity-70
      `}
    >
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Sign out
    </button>
  );
}
