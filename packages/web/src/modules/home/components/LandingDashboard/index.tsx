import { Input, Label, TextField } from '@heroui/react';
import AppSidebar from '@/shared/components/layout/AppSidebar';
import PageBody from '@/shared/components/layout/PageBody';
import EntitySelect from '@/shared/components/EntitySelect';
import ApplicationsHeader from '@/modules/application/components/ApplicationsHeader';
import ApplicationsList from '@/modules/application/components/ApplicationsList';
import { OrganizationTrigger } from '@/modules/organization/components/OrganizationSwitcher';
import { AccountLink } from '@/modules/auth/components/SessionAvatar';
import { DEMO_ROWS } from '@/modules/home/utils/demo/applications';
import { DEMO_ORGANIZATION, DEMO_USER } from '@/modules/home/utils/demo/entities';
import { IDLE, IDLE_ROW_ACTIONS } from '@/modules/home/utils/demo/idle';

const PROJECTS = [{ id: 1, name: 'Production' }];

const DEMO_COUNTS = { all: DEMO_ROWS.length, repository: 0, stack: 0, database: 0, template: 0 };

const LandingDashboard = () => (
    <div className='flex h-full bg-background text-foreground'>
        <AppSidebar
            panel='app'
            collapsed={false}
            organization={<OrganizationTrigger name={DEMO_ORGANIZATION} loading={false} collapsed={false} />}
            account={<AccountLink user={DEMO_USER} />}
        />

        <main className='min-w-0 flex-1 overflow-hidden'>
            <PageBody fill>
                <ApplicationsHeader kind='all' counts={DEMO_COUNTS} canAddDatabase onKindChange={IDLE} onAddApplication={IDLE} onAddCompose={IDLE} onAddDatabase={IDLE} onInstallTemplate={IDLE} />

                <div className='mt-6 flex flex-wrap items-center gap-3'>
                    <div className='max-w-xs flex-1'>
                        <EntitySelect
                            items={PROJECTS}
                            getKey={(project) => project.id}
                            getLabel={(project) => project.name}
                            value={1}
                            onChange={IDLE}
                            ariaLabel='Project'
                        />
                    </div>

                    <TextField value='' onChange={IDLE} validationBehavior='aria' className='max-w-xs flex-1'>
                        <Label className='sr-only'>Search</Label>
                        <Input placeholder='Search by name' autoComplete='off' />
                    </TextField>
                </div>

                <div className='mt-6 flex flex-1 flex-col'>
                    <ApplicationsList rows={DEMO_ROWS} {...IDLE_ROW_ACTIONS} />
                </div>
            </PageBody>
        </main>
    </div>
);

export default LandingDashboard;
