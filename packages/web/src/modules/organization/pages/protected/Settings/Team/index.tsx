import { useState } from 'react';
import { PageSkeleton } from '@/shared/components/skeletons';
import { Button, Label, Table } from '@heroui/react';
import { ArrowRight, Trash2, Users } from 'lucide-react';
import typia from 'typia';
import PageBody from '@/shared/components/layout/PageBody';
import PageHeader from '@/shared/components/layout/PageHeader';
import ListPageShell from '@/shared/components/ListPageShell';
import InlineError from '@/shared/components/InlineError';
import DeleteConfirmDialog from '@/shared/components/DeleteConfirmDialog';
import SingleFieldDialog from '@/shared/components/SingleFieldDialog';
import Field from '@/shared/components/forms/Field';
import EntitySelect from '@/shared/components/EntitySelect';
import { useForm } from '@/shared/hooks/forms/use-form';
import { useResource } from '@/shared/hooks/api/use-resource';
import { useMutation } from '@/shared/hooks/api/use-mutation';
import { organizationRoutes } from '@quantum/contracts/modules/organization/routes';
import { organizationApi } from '@/modules/organization/api/api';
import { useCurrentOrganizationId } from '@/modules/organization/hooks/use-current-organization-id';
import { tenancyErrorMessages } from '@/modules/organization/utils/error-messages';
import { errorCopy } from '@/shared/utils/error-copy';
import { OrganizationRole } from '@quantum/contracts/modules/organization/domain';
import type { Member } from '@quantum/contracts/modules/organization/domain';
import type { InviteMemberInput, UpdateMemberInput } from '@quantum/contracts/modules/organization/http';

const copy = errorCopy(tenancyErrorMessages);

const ROLES: OrganizationRole[] = [
    OrganizationRole.Owner,
    OrganizationRole.Admin,
    OrganizationRole.Member,
    OrganizationRole.Viewer
];

const ROLE_LABELS: Record<OrganizationRole, string> = {
    [OrganizationRole.Owner]: 'Owner',
    [OrganizationRole.Admin]: 'Admin',
    [OrganizationRole.Member]: 'Member',
    [OrganizationRole.Viewer]: 'Viewer'
};

interface InviteMemberDialogProps{
    organizationId: number;
    onClose: () => void;
    onInvited: () => void;
}

const InviteMemberDialog = ({ organizationId, onClose, onInvited }: InviteMemberDialogProps) => {
    const form = useForm<InviteMemberInput>({
        validate: typia.createValidate<InviteMemberInput>(),
        submitErrorMessages: tenancyErrorMessages,
        initialValues: { email: '', role: OrganizationRole.Member },
        onSubmit: async (values) => {
            await organizationApi.invite({ path: { orgId: organizationId }, body: values });
            onInvited();
            onClose();
        }
    });

    return (
        <SingleFieldDialog
            isOpen
            onOpenChange={(isOpen) => { if(!isOpen && !form.submitting) onClose(); }}
            title='Invite member'
            form={form}
            fieldName='email'
            fieldLabel='Email'
            fieldType='email'
            fieldPlaceholder='teammate@quantum.dev'
            extra={(
                <Field form={form} name='role'>
                    {(binding) => (
                        <div className='flex flex-col gap-1.5'>
                            <Label>Role</Label>
                            <EntitySelect
                                items={ROLES}
                                getKey={(role) => role}
                                getLabel={(role) => ROLE_LABELS[role]}
                                value={binding.value as OrganizationRole}
                                onChange={(key) => binding.onChange(key as OrganizationRole)}
                                ariaLabel='Role'
                                isDisabled={form.submitting}
                            />
                        </div>
                    )}
                </Field>
            )}
            submitLabel='Add member'
            onCancel={onClose}
        />
    );
};

interface TeamHeaderProps{
    onInvite: () => void;
}

const TeamHeader = ({ onInvite }: TeamHeaderProps) => (
    <PageHeader
        eyebrow='Settings'
        title='Team'
        description='Manage who can access this organization.'
        actions={(
            <Button onPress={onInvite}>
                Invite member
                <ArrowRight aria-hidden='true' className='size-4' />
            </Button>
        )}
    />
);

interface TeamRowProps{
    member: Member;
    isBusy: boolean;
    onRoleChange: (role: OrganizationRole) => void;
    onRemove: () => void;
}

const TeamRow = ({ member, isBusy, onRoleChange, onRemove }: TeamRowProps) => {
    const isOwner = member.role === OrganizationRole.Owner;

    return (
        <Table.Row>
            <Table.Cell>
                <span className='font-medium text-foreground'>{member.username}</span>
                {member.fullname !== '' && <span className='ml-2 text-muted'>{member.fullname}</span>}
            </Table.Cell>
            <Table.Cell>
                <span className='font-mono text-[0.8125rem]'>{member.email}</span>
            </Table.Cell>
            <Table.Cell>
                <EntitySelect
                    items={ROLES}
                    getKey={(role) => role}
                    getLabel={(role) => ROLE_LABELS[role]}
                    ariaLabel={`Role of ${member.username}`}
                    value={member.role}
                    onChange={(key) => onRoleChange(key as OrganizationRole)}
                    isDisabled={isOwner || isBusy}
                />
            </Table.Cell>
            <Table.Cell>
                <button
                    type='button'
                    disabled={isOwner}
                    onClick={onRemove}
                    aria-label={`Remove ${member.username}`}
                    className='flex p-1.5 text-muted transition-colors hover:text-foreground focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:pointer-events-none disabled:opacity-30 motion-reduce:transition-none'
                >
                    <Trash2 aria-hidden='true' className='size-4' />
                </button>
            </Table.Cell>
        </Table.Row>
    );
};

interface RemoveMemberDialogProps{
    organizationId: number;
    member: Member | null;
    onClose: () => void;
    onRemoved: () => void;
    onOptimisticRemove: () => () => void;
}

const RemoveMemberDialog = ({ organizationId, member, onClose, onRemoved, onOptimisticRemove }: RemoveMemberDialogProps) => (
    <DeleteConfirmDialog
        isOpen={member !== null}
        title='Remove member'
        description={member === null
            ? ''
            : `This removes ${member.username} from the organization. They will lose access to its projects.`}
        confirmLabel='Remove'
        entityId={member?.id ?? null}
        remove={(memberId) => organizationApi.removeMember({ path: { orgId: organizationId, id: memberId } })}
        getErrorMessage={copy}
        optimistic={onOptimisticRemove}
        onClose={onClose}
        onRemoved={onRemoved}
    />
);

interface TeamTableProps{
    organizationId: number;
    members: Member[];
    onChanged: () => void;
    onOptimisticRemove: (id: number) => () => void;
}

const TeamTable = ({ organizationId, members, onChanged, onOptimisticRemove }: TeamTableProps) => {
    const updateRole = useMutation((memberId: number, body: UpdateMemberInput) =>
        organizationApi.updateMember({ path: { orgId: organizationId, id: memberId }, body }));
    const [removeTarget, setRemoveTarget] = useState<Member | null>(null);

    const changeRole = (member: Member, role: OrganizationRole) => {
        void updateRole.run(member.id, { role }).then(() => onChanged(), () => undefined);
    };

    return (
        <div className='flex flex-col gap-4'>
            <Table>
                <Table.ScrollContainer>
                    <Table.Content aria-label='Team members'>
                        <Table.Header>
                            <Table.Column isRowHeader>Member</Table.Column>
                            <Table.Column>Email</Table.Column>
                            <Table.Column>Role</Table.Column>
                            <Table.Column><span className='sr-only'>Actions</span></Table.Column>
                        </Table.Header>

                        <Table.Body>
                            {members.map((member) => (
                                <TeamRow
                                    key={member.id}
                                    member={member}
                                    isBusy={updateRole.loading}
                                    onRoleChange={(role) => changeRole(member, role)}
                                    onRemove={() => setRemoveTarget(member)}
                                />
                            ))}
                        </Table.Body>
                    </Table.Content>
                </Table.ScrollContainer>
            </Table>

            {updateRole.error !== undefined && <InlineError>{copy(updateRole.error)}</InlineError>}

            <RemoveMemberDialog
                organizationId={organizationId}
                member={removeTarget}
                onClose={() => setRemoveTarget(null)}
                onRemoved={onChanged}
                onOptimisticRemove={() => onOptimisticRemove(removeTarget?.id ?? -1)}
            />
        </div>
    );
};

const Team = () => {
    const organizationId = useCurrentOrganizationId();
    const members = useResource(organizationRoutes, {
        list: 'members',
        request: organizationId === null ? null : { path: { orgId: organizationId } }
    });
    const [inviteOpen, setInviteOpen] = useState(false);

    if(organizationId === null || members.loading || members.error !== undefined){
        return (
            <ListPageShell
                fill
                loading={organizationId === null || members.loading}
                skeleton={<PageSkeleton actions={1} columns={4} />}
                error={organizationId === null ? undefined : members.error}
                errorTitle='Could not load team members'
                getErrorDescription={copy}
                onRetry={members.refresh}
            />
        );
    }

    const items = members.data ?? [];

    return (
        <PageBody fill>
            <TeamHeader onInvite={() => setInviteOpen(true)} />

            <div className='mt-10 flex flex-1 flex-col'>
                <ListPageShell
                    errorTitle='Could not load team members'
                    getErrorDescription={copy}
                    onRetry={members.refresh}
                    isEmpty={items.length === 0}
                    empty={{
                        icon: Users,
                        title: 'No members yet',
                        description: 'Invite an existing Quantum user to collaborate in this organization.',
                        action: (
                            <Button onPress={() => setInviteOpen(true)}>
                                Invite member
                                <ArrowRight aria-hidden='true' className='size-4' />
                            </Button>
                        )
                    }}
                >
                    <TeamTable
                        organizationId={organizationId}
                        members={items}
                        onChanged={members.refresh}
                        onOptimisticRemove={(id) => members.patch((list) => list.filter((item) => item.id !== id))}
                    />
                </ListPageShell>
            </div>

            {inviteOpen && (
                <InviteMemberDialog
                    organizationId={organizationId}
                    onClose={() => setInviteOpen(false)}
                    onInvited={members.refresh}
                />
            )}
        </PageBody>
    );
};

export default Team;
