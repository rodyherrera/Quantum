import { NavLink } from 'react-router-dom';
import { cn } from '@heroui/react';
import { LogOut, Search } from 'lucide-react';
import { navGroups, settingsEntry, settingsGroups } from '@/app/navigation/sections';
import { endSession } from '@/shared/services/end-session';
import { usePaletteStore } from '@/shared/store/palette';
import ThemeToggle from '@/shared/components/layout/ThemeToggle';
import { iconButtonClass, navItemClass, navLabelClass } from '@/shared/components/layout/sidebar-classes';
import SidebarToggle from '@/shared/components/layout/SidebarToggle';
import type { ReactNode } from 'react';
import type { NavGroup, NavSection } from '@/shared/contracts/navigation';

interface AppSidebarProps{
    panel: 'app' | 'settings';
    collapsed: boolean;
    organization: ReactNode;
    account: ReactNode;
    shortcuts?: ReactNode;
}

interface ItemProps{
    section: NavSection;
    collapsed: boolean;
}

const Item = ({ section: { label, to, icon: Icon }, collapsed }: ItemProps) => (
    <NavLink to={to} title={label} className={({ isActive }) => navItemClass(isActive, collapsed)}>
        <Icon className='size-[0.9375rem] shrink-0' aria-hidden='true' />
        <span className={navLabelClass(collapsed)}>{label}</span>
    </NavLink>
);

export const SidebarHeading = ({ label, collapsed }: { label: string; collapsed: boolean }) => (
    <>
        <span aria-hidden='true' className={cn('mx-2 my-2.5 border-t border-separator', !collapsed && 'lg:hidden')} />
        <h2 className={cn('mb-0.5 mt-3.5 px-2 text-xs font-medium text-subtle', navLabelClass(collapsed))}>{label}</h2>
    </>
);

interface GroupProps{
    group: NavGroup;
    collapsed: boolean;
}

const Group = ({ group, collapsed }: GroupProps) => (
    <div className='flex flex-col gap-px'>
        {group.heading !== undefined && <SidebarHeading label={group.heading} collapsed={collapsed} />}
        {group.items.map((section) => <Item key={section.to} section={section} collapsed={collapsed} />)}
    </div>
);

const AppSidebar = ({ panel, collapsed, organization, account, shortcuts }: AppSidebarProps) => {
    const groups = panel === 'settings' ? settingsGroups : navGroups;
    const openPalette = usePaletteStore((state) => state.setOpen);

    return (
        <aside data-collapsed={collapsed} className='app-sidebar flex h-full shrink-0 flex-col overflow-hidden px-2 pb-2 pt-2.5'>
            <div className={cn('mb-2.5 flex items-center gap-0.5', collapsed ? 'flex-col' : 'flex-col lg:flex-row')}>
                <div className='min-w-0 flex-1 self-stretch'>{organization}</div>

                <button
                    type='button'
                    onClick={() => openPalette(true)}
                    aria-label='Search and jump to'
                    title='Search and jump to  ⌘K'
                    aria-keyshortcuts='Meta+K Control+K'
                    className={iconButtonClass}
                >
                    <Search className='size-[0.9375rem]' aria-hidden='true' />
                </button>

                <SidebarToggle />
            </div>

            <nav aria-label={panel === 'settings' ? 'Settings' : 'Main'} className='flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-width:none]'>
                {groups.map((group, index) => <Group key={group.heading ?? index} group={group} collapsed={collapsed} />)}
                {panel === 'app' && shortcuts}
            </nav>

            <footer className={cn('flex shrink-0 items-center gap-0.5 pt-2', collapsed ? 'flex-col' : 'flex-col lg:flex-row')}>
                {account}

                <span className={cn('flex-1', navLabelClass(collapsed))} />

                <ThemeToggle />

                <NavLink
                    to={settingsEntry.to}
                    title={settingsEntry.label}
                    aria-label={settingsEntry.label}
                    className={({ isActive }) => cn(iconButtonClass, (isActive || panel === 'settings') && 'text-foreground')}
                >
                    <settingsEntry.icon className='size-[0.9375rem]' aria-hidden='true' />
                </NavLink>

                <button type='button' onClick={() => { void endSession(); }} aria-label='Sign out' title='Sign out' className={iconButtonClass}>
                    <LogOut className='size-[0.9375rem]' aria-hidden='true' />
                </button>
            </footer>
        </aside>
    );
};

export default AppSidebar;
