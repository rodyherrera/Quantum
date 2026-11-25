import { cn } from '@heroui/react';

interface CrosshairProps{
    className?: string;
}

/* A small + centred on the point its position names, where two of the landing's rules meet. */
const Crosshair = ({ className }: CrosshairProps) => (
    <span
        aria-hidden='true'
        className={cn(
            'pointer-events-none absolute -m-[5px] size-[11px]',
            'before:absolute before:inset-y-0 before:left-[5px] before:w-px before:bg-current',
            'after:absolute after:inset-x-0 after:top-[5px] after:h-px after:bg-current',
            className
        )}
    />
);

export default Crosshair;
