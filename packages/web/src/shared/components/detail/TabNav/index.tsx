import { NavLink } from 'react-router-dom';
import { cn } from '@heroui/react';
import type { LucideIcon } from 'lucide-react';

export interface TabNavItem{
    label: string;
    to: string;
    icon: LucideIcon;
    count?: number;
}

interface TabNavProps{
    label: string;
    items: readonly TabNavItem[];
}

const TabNav = ({ label, items }: TabNavProps) => (
    <nav aria-label={label} className='flex shrink-0 gap-0.5 overflow-x-auto border-b border-separator px-4 pb-2.5 pt-4 [scrollbar-width:none] sm:px-6'>
        {items.map(({ label: name, to, icon: Icon, count }) => (
            <NavLink
                key={to}
                to={to}
                className={({ isActive }) => cn(
                    'group inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 font-medium transition-colors motion-reduce:transition-none',
                    isActive ? 'bg-default text-foreground' : 'text-muted hover:bg-default hover:text-foreground'
                )}
            >
                <Icon aria-hidden='true' className='size-3.5 text-subtle group-aria-[current=page]:text-foreground' />
                {name}
                {count !== undefined && <span className='font-normal tabular-nums text-subtle'>{count}</span>}
            </NavLink>
        ))}
    </nav>
);

export default TabNav;
