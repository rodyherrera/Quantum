import { cn } from '@heroui/react';
import type { StatusColor } from '@/shared/utils/status';

const TONE: Record<StatusColor, string> = {
    success: 'text-success',
    accent: 'text-accent',
    default: 'text-subtle',
    warning: 'text-warning',
    danger: 'text-danger'
};

interface StatusGlyphProps{
    color: StatusColor;
    isTransient?: boolean;
    className?: string;
}

/* Linear's state vocabulary: a ring, a lit ring, a half-filled ring while it changes, a filled cross when it failed. */
export const StatusGlyph = ({ color, isTransient = false, className }: StatusGlyphProps) => (
    <svg viewBox='0 0 14 14' aria-hidden='true' className={cn('size-3.5 shrink-0', TONE[color], className)}>
        {color === 'danger' ? (
            <>
                <circle cx='7' cy='7' r='6.4' className='fill-current' />
                <path d='M5 5l4 4M9 5 5 9' className='stroke-background' strokeWidth='1.5' strokeLinecap='round' />
            </>
        ) : (
            <>
                <circle cx='7' cy='7' r='5.6' className='fill-none stroke-current' strokeWidth='1.5' />
                {isTransient || color === 'warning'
                    ? <path d='M7 3.4a3.6 3.6 0 0 1 0 7.2Z' className='fill-current' />
                    : color !== 'default' && <circle cx='7' cy='7' r='2.6' className='fill-current' />}
            </>
        )}
    </svg>
);

interface StatusDotProps extends StatusGlyphProps{
    label: string;
}

const StatusDot = ({ color, label, isTransient = false, className }: StatusDotProps) => (
    <span className={cn('inline-flex items-center gap-2 whitespace-nowrap', color === 'default' ? 'text-muted' : 'text-foreground', className)}>
        <StatusGlyph color={color} isTransient={isTransient} />
        {label}
    </span>
);

export default StatusDot;
