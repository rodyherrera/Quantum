import { Outlet, useLocation } from 'react-router-dom';
import AppSidebar from '@/shared/components/layout/AppSidebar';
import CommandPalette from '@/shared/components/CommandPalette';
import OrganizationSwitcher from '@/modules/organization/components/OrganizationSwitcher';
import ProjectShortcuts from '@/modules/project/components/ProjectShortcuts';
import SessionAvatar from '@/modules/auth/components/SessionAvatar';
import { useResourceStream } from '@/shared/hooks/api/use-resource-stream';
import { useSidebarStore } from '@/shared/store/sidebar';

const SETTINGS_PATHS = ['/settings', '/account', '/change-password'];

const panelFor = (pathname: string): 'app' | 'settings' =>
    SETTINGS_PATHS.some((path) => pathname.startsWith(path)) ? 'settings' : 'app';

const DashboardLayout = () => {
    const { pathname } = useLocation();
    const panel = panelFor(pathname);
    const collapsed = useSidebarStore((state) => state.collapsed);

    useResourceStream();

    return (
        <div className='flex h-dvh bg-canvas text-foreground' data-panel={panel}>
            <AppSidebar
                panel={panel}
                collapsed={collapsed}
                organization={<OrganizationSwitcher />}
                account={<SessionAvatar />}
                shortcuts={<ProjectShortcuts />}
            />

            <main className='page-view animate-enter flex min-w-0 flex-1 flex-col overflow-y-auto border-l border-separator bg-background lg:my-2 lg:mr-2 lg:rounded-[0.625rem] lg:border'>
                <Outlet />
            </main>

            <CommandPalette />
        </div>
    );
};

export default DashboardLayout;
