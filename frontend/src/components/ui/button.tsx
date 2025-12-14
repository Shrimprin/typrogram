import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/libs/shadcn/utils';

const primaryBase = `bg-primary text-primary-foreground shadow-[0_0_15px_rgba(34,211,238,0.4),0_0_30px_rgba(34,211,238,0.3)]`;

const buttonVariants = cva(
  `
    inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium
    whitespace-nowrap transition-all outline-none
    focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
    disabled:pointer-events-none disabled:opacity-50
    aria-invalid:border-destructive aria-invalid:ring-destructive/20
    dark:aria-invalid:ring-destructive/40
    [&_svg]:pointer-events-none [&_svg]:shrink-0
    [&_svg:not([class*='size-'])]:size-4
  `,
  {
    variants: {
      variant: {
        default: `
          ${primaryBase}
          hover:bg-primary/90
        `,
        primary: `
          ${primaryBase}
          hover:bg-[rgba(34,211,238,0.95)]
          hover:shadow-[0_0_25px_rgba(34,211,238,0.9),0_0_50px_rgba(34,211,238,0.7),0_0_75px_rgba(34,211,238,0.5)]
          dark:hover:bg-[rgba(34,211,238,0.95)]
          dark:hover:shadow-[0_0_25px_rgba(34,211,238,1.0),0_0_50px_rgba(34,211,238,0.8),0_0_75px_rgba(34,211,238,0.6)]
        `,
        destructive: `
          bg-destructive text-white shadow-xs
          hover:bg-destructive/90
          focus-visible:ring-destructive/20
          dark:bg-destructive/60 dark:focus-visible:ring-destructive/40
        `,
        outline: `
          border border-border bg-background shadow-xs transition-all
          hover:border-accent hover:bg-accent/20 hover:text-accent-foreground
          hover:shadow-[0_0_15px_rgba(255,255,255,0.8),0_0_30px_rgba(255,255,255,0.4)]
          dark:border-border dark:bg-input/30 dark:hover:bg-input/50
        `,
        secondary: `
          bg-secondary text-secondary-foreground shadow-xs
          hover:bg-secondary/80
        `,
        ghost: `
          transition-all
          hover:border-accent hover:bg-accent/20 hover:text-accent-foreground
          hover:shadow-[0_0_15px_rgba(255,255,255,0.8),0_0_30px_rgba(255,255,255,0.4)]
          dark:hover:bg-accent/50
        `,
        link: `
          text-primary underline-offset-4
          hover:underline
        `,
      },
      size: {
        default: `
          h-9 px-4 py-2
          has-[>svg]:px-3
        `,
        sm: `
          h-8 gap-1.5 rounded-md px-3
          has-[>svg]:px-2.5
        `,
        lg: `
          h-10 rounded-md px-6
          has-[>svg]:px-4
        `,
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };
