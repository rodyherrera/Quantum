import { cn } from '@heroui/react';

interface AvatarProps{
    fullname: string;
    className?: string;
}

const initialsOf = (fullname: string): string => {
    const parts = fullname.trim().split(/\s+/).filter((part) => part !== '');
    if(parts.length === 0) return '?';

    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
    return `${first}${last}`.toUpperCase();
};

const Avatar = ({ fullname, className = 'size-6' }: AvatarProps) => (
    <span
        aria-hidden='true'
        className={cn('flex shrink-0 items-center justify-center rounded-full bg-surface-tertiary text-[0.625rem] font-semibold text-foreground shadow-[inset_0_0_0_1px_var(--border)]', className)}
    >
        {initialsOf(fullname)}
    </span>
);

export default Avatar;
