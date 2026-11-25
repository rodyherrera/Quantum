import { Button, buttonVariants, cn, Dropdown } from '@heroui/react';
import { AppWindow, ChevronDown, Database, Layers, LayoutTemplate, Plus } from 'lucide-react';
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
        icon={AppWindow}
        actions={(
            <div className='flex'>
                <Button size='sm' className='rounded-r-none' onPress={onAddApplication}>
                    <Plus aria-hidden='true' />
                    <span className='hidden sm:inline'>New application</span>
                </Button>

                <Dropdown>
                    <Dropdown.Trigger
                        aria-label='More ways to deploy'
                        className={cn(buttonVariants({ size: 'sm', isIconOnly: true }), 'rounded-l-none border-l border-accent-foreground/20')}
                    >
                        <ChevronDown aria-hidden='true' />
                    </Dropdown.Trigger>

                    <Dropdown.Popover placement='bottom end'>
                        <Dropdown.Menu aria-label='Deploy'>
                            <Dropdown.Item key='compose' onAction={onAddCompose}>
                                <Layers aria-hidden='true' className='size-4 text-subtle' />
                                Deploy a stack
                            </Dropdown.Item>
                            <Dropdown.Item key='database' isDisabled={!canAddDatabase} onAction={onAddDatabase}>
                                <Database aria-hidden='true' className='size-4 text-subtle' />
                                New database
                            </Dropdown.Item>
                            <Dropdown.Item key='template' onAction={onInstallTemplate}>
                                <LayoutTemplate aria-hidden='true' className='size-4 text-subtle' />
                                Install a template
                            </Dropdown.Item>
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
