import AppSidebar from '@/shared/components/layout/AppSidebar';
import PageBody from '@/shared/components/layout/PageBody';
import ApplicationsHeader from '@/modules/application/components/ApplicationsHeader';
import ApplicationsFilters from '@/modules/application/components/ApplicationsFilters';
import ApplicationsList from '@/modules/application/components/ApplicationsList';
import { OrganizationTrigger } from '@/modules/organization/components/OrganizationSwitcher';
import { AccountLink } from '@/modules/auth/components/SessionAccount';
import { countKinds } from '@/modules/application/utils/application-rows';
import { DEMO_ROWS } from '@/modules/home/utils/demo/applications';
import { DEMO_ORGANIZATION, DEMO_USER } from '@/modules/home/utils/demo/entities';
import { IDLE, IDLE_ROW_ACTIONS } from '@/modules/home/utils/demo/idle';

const PROJECTS = [{ id: 1, name: 'Production' }];

const COUNTS = countKinds(DEMO_ROWS);

const LandingDashboard = () => (
    <div className='flex h-full bg-canvas text-foreground'>
        <AppSidebar
            panel='app'
            collapsed={false}
            organization={<OrganizationTrigger name={DEMO_ORGANIZATION} loading={false} collapsed={false} />}
            account={<AccountLink user={DEMO_USER} />}
        />

        <main className='my-2 mr-2 flex min-w-0 flex-1 flex-col overflow-hidden rounded-[0.625rem] border border-separator bg-background'>
            <ApplicationsHeader
                kind='all'
                counts={COUNTS}
                canAddDatabase
                onKindChange={IDLE}
                onAddApplication={IDLE}
                onAddCompose={IDLE}
                onAddDatabase={IDLE}
                onInstallTemplate={IDLE}
            />

            <ApplicationsFilters
                projects={PROJECTS}
                projectId={1}
                search=''
                shown={DEMO_ROWS.length}
                total={DEMO_ROWS.length}
                onProjectChange={IDLE}
                onSearchChange={IDLE}
            />

            <PageBody variant='flush' fill>
                <ApplicationsList rows={DEMO_ROWS} {...IDLE_ROW_ACTIONS} />
            </PageBody>
        </main>
    </div>
);

export default LandingDashboard;
