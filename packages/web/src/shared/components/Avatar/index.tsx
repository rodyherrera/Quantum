import { cn } from '@heroui/react';

const HUES = ['#6b75e2', '#d9682c', '#3f9f72', '#c2436e', '#2f8fbf', '#9a62d6'];

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

const hueOf = (fullname: string): string => {
    const sum = [...fullname].reduce((total, char) => total + char.charCodeAt(0), 0);
    return HUES[sum % HUES.length] ?? HUES[0];
};

const Avatar = ({ fullname, className = 'size-6' }: AvatarProps) => (
    <span
        aria-hidden='true'
        style={{ backgroundColor: hueOf(fullname) }}
        className={cn('flex shrink-0 items-center justify-center rounded-full text-[0.625rem] font-semibold text-white', className)}
    >
        {initialsOf(fullname)}
    </span>
);

export default Avatar;
