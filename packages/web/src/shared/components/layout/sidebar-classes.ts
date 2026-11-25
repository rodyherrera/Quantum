import { cn } from '@heroui/react';

export const navItemClass = (active: boolean, collapsed: boolean) => cn(
    'flex h-7 shrink-0 items-center gap-2.5 rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent motion-reduce:transition-none',
    collapsed ? 'justify-center' : 'justify-center px-2 lg:justify-start',
    active ? 'bg-default text-foreground [&>svg]:text-foreground' : 'text-muted hover:bg-default hover:text-foreground [&>svg]:text-subtle'
);

export const navLabelClass = (collapsed: boolean): string => (collapsed ? 'hidden' : 'hidden truncate lg:inline');

export const iconButtonClass =
    'flex size-7 shrink-0 items-center justify-center rounded-md text-subtle transition-colors hover:bg-default hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent motion-reduce:transition-none';
