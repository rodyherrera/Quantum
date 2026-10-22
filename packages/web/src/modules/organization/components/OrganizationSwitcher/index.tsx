import { useState } from 'react';
import {
    Button,
    Input,
    ListBox,
    ListBoxItem,
    Popover,
    Separator,
    Skeleton,
    TextField,
    AutocompleteFilter,
    useFilter
} from '@heroui/react';
import { ChevronsUpDown, Plus } from 'lucide-react';
import Modal from '@/shared/components/Modal';
import CreateOrganizationForm from '@/modules/organization/components/CreateOrganizationForm';
import { useTenancy } from '@/modules/organization/hooks/use-tenancy';
import { useTenantStore } from '@/shared/store/tenant';
import { useSidebarStore } from '@/shared/store/sidebar';
import type { Organization } from '@quantum/contracts/modules/organization/domain';

interface OrganizationTriggerProps{
    name: string | undefined;
    loading: boolean;
    collapsed: boolean;
}

export const OrganizationTrigger = ({ name, loading, collapsed }: OrganizationTriggerProps) => (
    <Button
        variant='ghost'
        size='sm'
        aria-haspopup='dialog'
        aria-label={`Organization: ${name ?? 'none'}`}
        className={`is-plain h-9 w-full gap-2 text-foreground ${collapsed ? 'justify-center px-0' : 'justify-center px-0 lg:justify-between lg:px-2'}`}
    >
        {!collapsed && (
            <span className='hidden min-w-0 flex-1 truncate text-left lg:inline'>
                {loading ? <Skeleton className='inline-block h-3 w-20' /> : name ?? 'No organization'}
            </span>
        )}
        <ChevronsUpDown aria-hidden='true' className='size-3.5 shrink-0 text-muted' />
    </Button>
);

interface OrganizationRowProps{
    organization: Organization;
}

const OrganizationRow = ({ organization }: OrganizationRowProps) => (
    <ListBoxItem id={organization.id} textValue={organization.name}>
        <span className='flex-1 truncate capitalize'>{organization.name}</span>
        <ListBoxItem.Indicator />
    </ListBoxItem>
);

const OrganizationSwitcher = () => {
    const collapsed = useSidebarStore((state) => state.collapsed);
    const { organizations, current, loading, reload } = useTenancy();
    const setOrganizationId = useTenantStore((state) => state.setOrganizationId);
    const { contains } = useFilter({ sensitivity: 'base' });

    const [open, setOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    if(!loading && organizations.length === 0) return null;

    return (
        <>
            <Popover.Root isOpen={open} onOpenChange={setOpen}>
                <Popover.Trigger>
                    <OrganizationTrigger name={current?.name} loading={loading} collapsed={collapsed} />
                </Popover.Trigger>

                <Popover.Content placement='bottom start' className='w-72 max-w-[calc(100vw_-_2rem)]'>
                    <Popover.Dialog className='p-1.5'>
                        <AutocompleteFilter filter={contains}>
                            <TextField
                                aria-label='Find organization'
                                autoFocus
                                fullWidth
                                className='border-0 bg-transparent pb-1 shadow-none'
                            >
                                <Input placeholder='Find organization…' className='border-0 bg-transparent shadow-none' />
                            </TextField>

                            <ListBox
                                aria-label='Organizations'
                                selectionMode='single'
                                disallowEmptySelection
                                selectedKeys={current ? [current.id] : []}
                                onSelectionChange={(keys) => {
                                    const [key] = keys === 'all' ? [] : keys;
                                    if(key !== undefined) setOrganizationId(Number(key));
                                    setOpen(false);
                                }}
                                renderEmptyState={() => (
                                    <p className='py-3 text-center text-[0.8125rem] text-muted'>No organizations found</p>
                                )}
                                className='max-h-64 overflow-y-auto'
                            >
                                {organizations.map((organization) => (
                                    <OrganizationRow key={organization.id} organization={organization} />
                                ))}
                            </ListBox>
                        </AutocompleteFilter>

                        <Separator className='my-1' />

                        <button
                            type='button'
                            className='flex min-h-9 w-full items-center gap-2 px-2.5 text-[0.8125rem] text-muted transition-colors hover:bg-default hover:text-foreground'
                            onClick={() => {
                                setOpen(false);
                                setCreating(true);
                            }}
                        >
                            <Plus aria-hidden='true' className='size-4' />
                            Create Organization
                        </button>
                    </Popover.Dialog>
                </Popover.Content>
            </Popover.Root>

            <Modal isOpen={creating} onOpenChange={setCreating} title='Create organization'>
                <CreateOrganizationForm
                    onCreated={() => {
                        reload();
                        setCreating(false);
                    }}
                />
            </Modal>
        </>
    );
};

export default OrganizationSwitcher;
