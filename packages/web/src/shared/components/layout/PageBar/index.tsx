import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

export interface Crumb{
    label: string;
    to: string;
}

interface PageBarProps{
    title: string;
    trail?: Crumb[];
    children?: ReactNode;
    actions?: ReactNode;
}

/*
 * The 44px bar on top of every page: where you are on the left, what you can do on the right.
 * Filters in the middle scroll, so on a narrow screen they give up their room before the title does.
 */
const PageBar = ({ title, trail = [], children, actions }: PageBarProps) => (
    <header className='sticky top-0 z-20 flex h-[var(--bar-height)] shrink-0 items-center gap-2 border-b border-separator bg-background px-4'>
        <nav aria-label='Breadcrumb' className='flex min-w-0 items-center gap-1.5'>
            {trail.map((crumb) => (
                <Fragment key={crumb.to}>
                    <Link
                        to={crumb.to}
                        className='-mx-1 truncate rounded px-1 font-medium text-muted transition-colors hover:bg-default hover:text-foreground motion-reduce:transition-none'
                    >
                        {crumb.label}
                    </Link>
                    <ChevronRight aria-hidden='true' className='size-3 shrink-0 text-subtle' />
                </Fragment>
            ))}

            <h1 className='min-w-[min(7rem,40vw)] truncate font-medium text-foreground'>{title}</h1>
        </nav>

        {children !== undefined && (
            <div className='ml-1.5 flex min-w-0 shrink-100 items-center gap-1 overflow-x-auto [scrollbar-width:none]'>{children}</div>
        )}

        {actions !== undefined && <div className='ml-auto flex shrink-0 items-center gap-1.5'>{actions}</div>}
    </header>
);

export default PageBar;
