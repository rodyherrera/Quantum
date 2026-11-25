import { cn } from '@heroui/react';
import type { ReactNode } from 'react';

const SIZE = {
    md: 'size-7 rounded-[0.4375rem] [&>svg]:size-[0.9375rem]',
    lg: 'size-11 rounded-[0.625rem] text-lg [&>svg]:size-[1.375rem]'
} as const;

interface IconTileProps{
    hue: string;
    size?: keyof typeof SIZE;
    children: ReactNode;
}

const IconTile = ({ hue, size = 'md', children }: IconTileProps) => (
    <span
        aria-hidden='true'
        style={{ background: `linear-gradient(135deg, ${hue}, color-mix(in srgb, ${hue} 70%, #000))` }}
        className={cn('grid shrink-0 place-items-center font-semibold leading-none text-white', SIZE[size])}
    >
        {children}
    </span>
);

export default IconTile;
