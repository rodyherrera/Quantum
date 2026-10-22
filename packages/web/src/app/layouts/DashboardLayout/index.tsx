import { Outlet, useLocation } from 'react-router-dom';
import AppSidebar from '@/shared/components/layout/AppSidebar';
import OrganizationSwitcher from '@/modules/organization/components/OrganizationSwitcher';
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
        <div className='flex h-dvh bg-background text-foreground' data-panel={panel}>
            <AppSidebar
                panel={panel}
                collapsed={collapsed}
                organization={<OrganizationSwitcher />}
                account={<SessionAvatar />}
            />

            <main className='page-view animate-enter min-w-0 flex-1 overflow-y-auto'>
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
