import { useState } from 'react';
import { FieldsSkeleton } from '@/shared/components/skeletons';
import { useNavigate } from 'react-router-dom';
import { Button, Chip } from '@heroui/react';
import { Building2, Trash2 } from 'lucide-react';
import typia from 'typia';
import PageBar from '@/shared/components/layout/PageBar';
import PageBody from '@/shared/components/layout/PageBody';
import PageIntro from '@/shared/components/layout/PageIntro';
import SettingsSection from '@/shared/components/SettingsSection';
import SettingsRow from '@/shared/components/SettingsRow';
import DeleteConfirmDialog from '@/shared/components/DeleteConfirmDialog';
import Form from '@/shared/components/forms/Form';
import Field from '@/shared/components/forms/Field';
import RegistrySection from '@/modules/registry/components/RegistrySection';
import { useForm } from '@/shared/hooks/forms/use-form';
import { useTenancy } from '@/modules/organization/hooks/use-tenancy';
import { organizationApi } from '@/modules/organization/api/api';
import { tenancyErrorMessages } from '@/modules/organization/utils/error-messages';
import { SETTINGS_TRAIL } from '@/modules/organization/utils/settings-trail';
import { errorCopy } from '@/shared/utils/error-copy';
import { formatDate } from '@/shared/utils/format-date';
import { useTenantStore } from '@/shared/store/tenant';
import type { Organization } from '@quantum/contracts/modules/organization/domain';
import type { UpdateOrganizationInput } from '@quantum/contracts/modules/organization/http';

const copy = errorCopy(tenancyErrorMessages);

interface OrganizationFormProps{
    organization: Organization;
    onSaved: () => void;
}

const RenameOrganizationForm = ({ organization, onSaved }: OrganizationFormProps) => {
    const form = useForm<UpdateOrganizationInput>({
        validate: typia.createValidate<UpdateOrganizationInput>(),
        submitErrorMessages: tenancyErrorMessages,
        initialValues: { name: organization.name },
        onSubmit: async (values) => {
            await organizationApi.update({ path: { id: organization.id }, body: values });
            onSaved();
        }
    });

    return (
        <Form form={form} className='flex flex-wrap items-start justify-end gap-2 [&>p]:basis-full [&>p]:text-right [&_.label]:sr-only'>
            <div className='w-56'>
                <Field form={form} name='name' label='Name' placeholder='my-organization' />
            </div>

            <Button type='submit' variant='secondary' isPending={form.submitting} isDisabled={!form.isValid}>Save</Button>
        </Form>
    );
};

const General = ({ organization, onSaved }: OrganizationFormProps) => (
    <SettingsSection title='General'>
        <SettingsRow
            title='Name'
            description='How the organization shows up in the switcher.'
            action={<RenameOrganizationForm key={organization.id} organization={organization} onSaved={onSaved} />}
        />
        <SettingsRow title='Slug' action={<span className='font-mono text-xs text-muted'>{organization.slug}</span>} />
        <SettingsRow title='Type' action={<Chip size='sm'>{organization.isPersonal ? 'Personal' : 'Team'}</Chip>} />
        <SettingsRow title='Created' action={<span className='text-muted'>{formatDate(organization.createdAt)}</span>} />
    </SettingsSection>
);

interface DeleteOrganizationDialogProps{
    organization: Organization;
    isOpen: boolean;
    onClose: (isOpen: boolean) => void;
    onRemoved: () => void;
}

const DeleteOrganizationDialog = ({ organization, isOpen, onClose, onRemoved }: DeleteOrganizationDialogProps) => (
    <DeleteConfirmDialog
        isOpen={isOpen}
        title='Delete organization'
        description={`This permanently removes ${organization.name} and everything inside it. This action cannot be undone.`}
        entityId={organization.id}
        remove={(organizationId) => organizationApi.remove({ path: { id: organizationId } })}
        getErrorMessage={copy}
        onClose={() => onClose(false)}
        onRemoved={onRemoved}
    />
);

const DangerZone = ({ organization }: { organization: Organization }) => {
    const clearTenant = useTenantStore((state) => state.clear);
    const navigate = useNavigate();
    const [deleteOpen, setDeleteOpen] = useState(false);

    return (
        <>
            <SettingsSection title='Delete organization' tone='danger'>
                <SettingsRow
                    title={`Delete ${organization.name}`}
                    description='Permanently removes it and all of its projects, environments and resources. This cannot be undone.'
                    action={(
                        <Button size='sm' variant='danger' onPress={() => setDeleteOpen(true)}>
                            <Trash2 aria-hidden='true' />
                            Delete organization
                        </Button>
                    )}
                />
            </SettingsSection>

            <DeleteOrganizationDialog
                organization={organization}
                isOpen={deleteOpen}
                onClose={setDeleteOpen}
                onRemoved={() => { clearTenant(); navigate('/applications'); }}
            />
        </>
    );
};

const OrganizationSettings = () => {
    const { current, reload } = useTenancy();

    return (
        <>
            <PageBar title='Organization' icon={Building2} trail={SETTINGS_TRAIL} />

            <PageBody variant='narrow'>
                <div className='flex flex-col gap-8'>
                    <PageIntro
                        title='Organization'
                        description='Rename it, review its details, manage registry credentials, or delete it.'
                    />

                    {current === null ? <FieldsSkeleton rows={3} /> : (
                        <>
                            <General organization={current} onSaved={reload} />
                            <RegistrySection key={`registries-${current.id}`} organizationId={current.id} />
                            <DangerZone organization={current} />
                        </>
                    )}
                </div>
            </PageBody>
        </>
    );
};

export default OrganizationSettings;
