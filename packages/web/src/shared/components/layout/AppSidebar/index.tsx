import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { navGroups, settingsEntry, settingsGroups } from '@/app/navigation/sections';
import { endSession } from '@/shared/services/end-session';
import ThemeToggle from '@/shared/components/layout/ThemeToggle';
import SidebarToggle from '@/shared/components/layout/SidebarToggle';
import type { ReactNode } from 'react';
import type { NavGroup, NavSection } from '@/shared/contracts/navigation';

interface AppSidebarProps{
    panel: 'app' | 'settings';
    collapsed: boolean;
    organization: ReactNode;
    account: ReactNode;
}

const labelClass = (collapsed: boolean): string => (collapsed ? 'hidden' : 'hidden truncate lg:inline');

const itemClass = (active: boolean, collapsed: boolean): string =>
    `flex h-9 items-center gap-3 rounded-md text-sm transition-colors focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none ${
        collapsed ? 'justify-center' : 'justify-center px-2 lg:justify-start'
    } ${active ? 'font-medium text-foreground' : 'text-muted hover:text-foreground'}`;

const iconButtonClass =
    'flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:text-foreground focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none';

interface ItemProps{
    section: NavSection;
    collapsed: boolean;
}

const Item = ({ section: { label, to, icon: Icon }, collapsed }: ItemProps) => (
    <NavLink to={to} title={label} className={({ isActive }) => itemClass(isActive, collapsed)}>
        <Icon className='size-4 shrink-0' aria-hidden='true' />
        <span className={labelClass(collapsed)}>{label}</span>
    </NavLink>
);

interface GroupProps{
    group: NavGroup;
    collapsed: boolean;
}

const Group = ({ group, collapsed }: GroupProps) => (
    <div className='flex flex-col gap-0.5'>
        {group.heading !== undefined && (
            <>
                {}
                <span aria-hidden='true' className={`mx-2 my-3 border-t border-separator ${collapsed ? '' : 'lg:hidden'}`} />
                <h2 className={`label-caps mb-2 mt-7 px-2 text-muted ${labelClass(collapsed)}`}>{group.heading}</h2>
            </>
        )}

        {group.items.map((section) => <Item key={section.to} section={section} collapsed={collapsed} />)}
    </div>
);

const AppSidebar = ({ panel, collapsed, organization, account }: AppSidebarProps) => {
    const groups = panel === 'settings' ? settingsGroups : navGroups;

    const signOut = () => {
        void endSession();
    };

    return (
        <aside
            data-collapsed={collapsed}
            className='app-sidebar flex h-full shrink-0 flex-col overflow-hidden border-r border-separator'
        >
            <div className={`flex h-14 shrink-0 items-center ${collapsed ? 'justify-center px-2' : 'justify-center px-2 lg:justify-between lg:pl-4 lg:pr-2'}`}>
                <NavLink to='/applications' aria-label='Quantum' className={`wordmark text-foreground ${labelClass(collapsed)}`}>
                    Quantum
                </NavLink>
                <SidebarToggle />
            </div>

            <nav aria-label={panel === 'settings' ? 'Settings' : 'Main'} className='flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pt-3'>
                {groups.map((group, index) => <Group key={group.heading ?? index} group={group} collapsed={collapsed} />)}
            </nav>

            {}
            <footer className='flex shrink-0 flex-col gap-1 border-t border-separator p-2'>
                {organization}

                <div className={`flex gap-1 ${collapsed ? 'flex-col items-center' : 'flex-col items-center lg:flex-row lg:items-center'}`}>
                    {account}

                    <span className={`flex-1 ${labelClass(collapsed)}`} />

                    <ThemeToggle />

                    <NavLink
                        to={settingsEntry.to}
                        title={settingsEntry.label}
                        aria-label={settingsEntry.label}
                        className={({ isActive }) => `${iconButtonClass} ${isActive || panel === 'settings' ? 'text-foreground' : ''}`}
                    >
                        <settingsEntry.icon className='size-4' aria-hidden='true' />
                    </NavLink>

                    <button type='button' onClick={signOut} aria-label='Sign out' title='Sign out' className={iconButtonClass}>
                        <LogOut className='size-4' aria-hidden='true' />
                    </button>
                </div>
            </footer>
        </aside>
    );
};

export default AppSidebar;
