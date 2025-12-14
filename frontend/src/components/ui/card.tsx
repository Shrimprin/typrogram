import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/libs/shadcn/utils';

const cardVariants = cva('flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm', {
  variants: {
    variant: {
      default: '',
      outline: `
        border border-border bg-background shadow-xs transition-all
        hover:border-accent hover:bg-accent/20 hover:text-accent-foreground
        hover:shadow-[0_0_15px_rgba(255,255,255,0.8),0_0_30px_rgba(255,255,255,0.4)]
        dark:border-border dark:bg-input/30 dark:hover:bg-input/50
      `,
      interactive: `
        cursor-pointer transition-all
        hover:border-accent hover:bg-accent/20 hover:text-accent-foreground
        hover:shadow-[0_0_15px_rgba(255,255,255,0.8),0_0_30px_rgba(255,255,255,0.4)]
        dark:hover:bg-accent/50
      `,
      selectedInteractive: `
        cursor-pointer border-primary bg-primary/5 transition-all
        hover:border-primary/80 hover:bg-primary/8
        hover:shadow-[0_0_15px_rgba(59,130,246,0.6),0_0_30px_rgba(59,130,246,0.3)]
        dark:hover:shadow-[0_0_15px_rgba(96,165,250,0.6),0_0_30px_rgba(96,165,250,0.3)]
      `,
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

function Card({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof cardVariants>) {
  return <div data-slot="card" className={cn(cardVariants({ variant, className }))} {...props} />;
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        `
          @container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6
          has-data-[slot=card-action]:grid-cols-[1fr_auto]
          [.border-b]:pb-6
        `,
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-title" className={cn('leading-none font-semibold', className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-description" className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-6', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        `
          flex items-center px-6
          [.border-t]:pt-6
        `,
        className,
      )}
      {...props}
    />
  );
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
