import { Button, buttonVariants, cn, Dropdown } from '@heroui/react';
import { ChevronDown } from 'lucide-react';
import PageBar from '@/shared/components/layout/PageBar';
import ViewTabs from '@/shared/components/layout/ViewTabs';
import type { KindFilter } from '@/modules/application/utils/application-rows';

const VIEWS: { id: KindFilter; label: string }[] = [
    { id: 'all', label: 'All applications' },
    { id: 'repository', label: 'Repositories' },
    { id: 'stack', label: 'Stacks' },
    { id: 'database', label: 'Databases' },
    { id: 'template', label: 'Templates' }
];

interface ApplicationsHeaderProps{
    kind: KindFilter;
    counts: Record<KindFilter, number>;
    canAddDatabase: boolean;
    onKindChange: (kind: KindFilter) => void;
    onAddApplication: () => void;
    onAddCompose: () => void;
    onAddDatabase: () => void;
    onInstallTemplate: () => void;
}

const ApplicationsHeader = ({
    kind,
    counts,
    canAddDatabase,
    onKindChange,
    onAddApplication,
    onAddCompose,
    onAddDatabase,
    onInstallTemplate
}: ApplicationsHeaderProps) => (
    <PageBar
        title='Applications'
        actions={(
            <div className='flex'>
                <Button size='sm' aria-label='New application' className='rounded-r-none!' onPress={onAddApplication}>
                    <span className='sm:hidden'>New</span>
                    <span className='hidden sm:inline'>New application</span>
                </Button>

                <Dropdown>
                    <Dropdown.Trigger
                        aria-label='More ways to deploy'
                        className={cn(buttonVariants({ size: 'sm', isIconOnly: true }), 'rounded-l-none! border-l border-accent-foreground/20')}
                    >
                        <ChevronDown aria-hidden='true' />
                    </Dropdown.Trigger>

                    <Dropdown.Popover placement='bottom end'>
                        <Dropdown.Menu aria-label='Deploy'>
                            <Dropdown.Item key='compose' onAction={onAddCompose}>Deploy a stack</Dropdown.Item>
                            <Dropdown.Item key='database' isDisabled={!canAddDatabase} onAction={onAddDatabase}>New database</Dropdown.Item>
                            <Dropdown.Item key='template' onAction={onInstallTemplate}>Install a template</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown>
            </div>
        )}
    >
        <ViewTabs
            label='Show'
            value={kind}
            onChange={onKindChange}
            items={VIEWS.map((view) => ({ ...view, count: counts[view.id] }))}
        />
    </PageBar>
);

export default ApplicationsHeader;
