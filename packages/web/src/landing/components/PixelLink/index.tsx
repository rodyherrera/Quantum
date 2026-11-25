import { Link } from 'react-router-dom';
import { cn } from '@heroui/react';
import type { ReactNode } from 'react';

/* ink and paper sit on the blue field whatever the theme; theme follows the page. */
const TONE = {
    ink: { body: 'bg-[#05060a] text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.14)] hover:bg-[#161821]', corner: 'bg-white' },
    paper: { body: 'bg-white text-[#05060a] hover:bg-[#e4eafa]', corner: 'bg-white' },
    theme: { body: 'bg-foreground text-background hover:bg-foreground/85', corner: 'bg-foreground' }
} as const;

const SIZE = {
    md: 'h-10 px-5',
    sm: 'h-8 px-3.5'
} as const;

const CORNERS = ['-left-[3px] -top-[3px]', '-right-[3px] -top-[3px]', '-bottom-[3px] -left-[3px]', '-bottom-[3px] -right-[3px]'];

type PixelLinkProps = {
    tone?: keyof typeof TONE;
    size?: keyof typeof SIZE;
    children: ReactNode;
} & ({ to: string; href?: never } | { href: string; to?: never });

/* A square button with a pixel at each corner. href opens another site in a new tab. */
const PixelLink = ({ tone = 'ink', size = 'md', children, ...target }: PixelLinkProps) => {
    const className = cn(
        'relative inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium outline-none transition-colors',
        'focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-current motion-reduce:transition-none [&>svg]:size-3.5',
        TONE[tone].body,
        SIZE[size]
    );

    const content = (
        <>
            {children}
            {CORNERS.map((corner) => <span key={corner} aria-hidden='true' className={cn('absolute size-[5px]', TONE[tone].corner, corner)} />)}
        </>
    );

    return target.href !== undefined
        ? <a href={target.href} target='_blank' rel='noreferrer' className={className}>{content}</a>
        : <Link to={target.to} className={className}>{content}</Link>;
};

export default PixelLink;
