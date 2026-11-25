import { useState } from 'react';
import { FieldsSkeleton } from '@/shared/components/skeletons';
import { Button, Chip, Label } from '@heroui/react';
import { Trash2 } from 'lucide-react';
import typia from 'typia';
import PageBar from '@/shared/components/layout/PageBar';
import PageBody from '@/shared/components/layout/PageBody';
import PageIntro from '@/shared/components/layout/PageIntro';
import Segmented from '@/shared/components/layout/Segmented';
import SettingsSection from '@/shared/components/SettingsSection';
import ListPageShell from '@/shared/components/ListPageShell';
import InlineError from '@/shared/components/InlineError';
import DeleteConfirmDialog from '@/shared/components/DeleteConfirmDialog';
import SingleFieldDialog from '@/shared/components/SingleFieldDialog';
import Field from '@/shared/components/forms/Field';
import EntitySelect from '@/shared/components/EntitySelect';
import { useForm } from '@/shared/hooks/forms/use-form';
import { useResource } from '@/shared/hooks/api/use-resource';
import { useMutation } from '@/shared/hooks/api/use-mutation';
import { useSession } from '@/modules/auth/hooks/use-session';
import { organizationRoutes } from '@quantum/contracts/modules/organization/routes';
import { organizationApi } from '@/modules/organization/api/api';
import { useCurrentOrganizationId } from '@/modules/organization/hooks/use-current-organization-id';
import { tenancyErrorMessages } from '@/modules/organization/utils/error-messages';
import { SETTINGS_TRAIL } from '@/modules/organization/utils/settings-trail';
import { errorCopy } from '@/shared/utils/error-copy';
import { formatDate, formatDay } from '@/shared/utils/format-date';
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
                        <div className='flex flex-col items-start gap-1.5'>
                            <Label>Role</Label>
                            <Segmented
                                label='Role'
                                options={ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }))}
                                value={binding.value as OrganizationRole}
                                onChange={(role) => binding.onChange(role)}
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

interface MemberRowProps{
    member: Member;
    isYou: boolean;
    isBusy: boolean;
    onRoleChange: (role: OrganizationRole) => void;
    onRemove: () => void;
}

const MemberRow = ({ member, isYou, isBusy, onRoleChange, onRemove }: MemberRowProps) => {
    const isOwner = member.role === OrganizationRole.Owner;
    const name = member.fullname === '' ? member.username : member.fullname;

    return (
        <div className='flex min-h-14 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5'>
            <div className='flex min-w-0 flex-1 basis-56 flex-col'>
                <span className='truncate font-medium text-foreground'>
                    {name}
                    {isYou && <span className='font-normal text-subtle'> (you)</span>}
                </span>
                <span className='truncate text-xs text-subtle'>{member.email}</span>
            </div>

            <div className='flex shrink-0 items-center gap-3'>
                <time dateTime={member.createdAt} title={formatDate(member.createdAt)} className='hidden text-xs text-subtle sm:block'>
                    Joined {formatDay(member.createdAt)}
                </time>

                {isOwner ? <Chip size='sm'>{ROLE_LABELS[member.role]}</Chip> : (
                    <div className='w-28'>
                        <EntitySelect
                            items={ROLES}
                            getKey={(role) => role}
                            getLabel={(role) => ROLE_LABELS[role]}
                            ariaLabel={`Role of ${member.username}`}
                            value={member.role}
                            onChange={(key) => onRoleChange(key as OrganizationRole)}
                            isDisabled={isBusy}
                        />
                    </div>
                )}

                <Button
                    isIconOnly
                    size='sm'
                    variant='ghost'
                    isDisabled={isOwner}
                    aria-label={`Remove ${member.username}`}
                    onPress={onRemove}
                >
                    <Trash2 aria-hidden='true' />
                </Button>
            </div>
        </div>
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

interface MembersProps{
    organizationId: number;
    members: Member[];
    onChanged: () => void;
    onOptimisticRemove: (id: number) => () => void;
}

const Members = ({ organizationId, members, onChanged, onOptimisticRemove }: MembersProps) => {
    const { user } = useSession();
    const updateRole = useMutation((memberId: number, body: UpdateMemberInput) =>
        organizationApi.updateMember({ path: { orgId: organizationId, id: memberId }, body }));
    const [removeTarget, setRemoveTarget] = useState<Member | null>(null);

    const changeRole = (member: Member, role: OrganizationRole) => {
        void updateRole.run(member.id, { role }).then(() => onChanged(), () => undefined);
    };

    return (
        <div className='flex flex-col gap-3'>
            <SettingsSection title='Members'>
                {members.map((member) => (
                    <MemberRow
                        key={member.id}
                        member={member}
                        isYou={member.userId === user?.id}
                        isBusy={updateRole.loading}
                        onRoleChange={(role) => changeRole(member, role)}
                        onRemove={() => setRemoveTarget(member)}
                    />
                ))}
            </SettingsSection>

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

    const items = members.data ?? [];
    const loaded = organizationId !== null && !members.loading && members.error === undefined;
    const inviteButton = (
        <Button size='sm' onPress={() => setInviteOpen(true)}>
            Invite member
        </Button>
    );

    return (
        <>
            <PageBar title='Team' trail={SETTINGS_TRAIL} actions={loaded ? inviteButton : undefined} />

            <PageBody variant='narrow'>
                <div className='flex flex-col gap-8'>
                    <PageIntro title='Team' description='Manage who can access this organization.' />

                    <ListPageShell
                        bare
                        loading={organizationId === null || members.loading}
                        skeleton={<FieldsSkeleton rows={3} />}
                        error={organizationId === null ? undefined : members.error}
                        errorTitle='Could not load team members'
                        getErrorDescription={copy}
                        onRetry={members.refresh}
                        isEmpty={items.length === 0}
                        empty={{
                            title: 'No members yet',
                            description: 'Invite an existing Quantum user to collaborate in this organization.',
                            action: inviteButton
                        }}
                    >
                        {organizationId !== null && (
                            <Members
                                organizationId={organizationId}
                                members={items}
                                onChanged={members.refresh}
                                onOptimisticRemove={(id) => members.patch((list) => list.filter((item) => item.id !== id))}
                            />
                        )}
                    </ListPageShell>
                </div>
            </PageBody>

            {inviteOpen && organizationId !== null && (
                <InviteMemberDialog
                    organizationId={organizationId}
                    onClose={() => setInviteOpen(false)}
                    onInvited={members.refresh}
                />
            )}
        </>
    );
};

export default Team;
