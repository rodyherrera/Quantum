import { useState } from 'react';
import { FieldsSkeleton } from '@/shared/components/skeletons';
import { useNavigate } from 'react-router-dom';
import { Button } from '@heroui/react';
import { ArrowRight } from 'lucide-react';
import typia from 'typia';
import PageBody from '@/shared/components/layout/PageBody';
import PageHeader from '@/shared/components/layout/PageHeader';
import SettingsSection from '@/shared/components/SettingsSection';
import DeleteConfirmDialog from '@/shared/components/DeleteConfirmDialog';
import Form from '@/shared/components/forms/Form';
import Field from '@/shared/components/forms/Field';
import RegistrySection from '@/modules/registry/components/RegistrySection';
import { useForm } from '@/shared/hooks/forms/use-form';
import { useTenancy } from '@/modules/organization/hooks/use-tenancy';
import { organizationApi } from '@/modules/organization/api/api';
import { tenancyErrorMessages } from '@/modules/organization/utils/error-messages';
import { errorCopy } from '@/shared/utils/error-copy';
import { useTenantStore } from '@/shared/store/tenant';
import type { Organization } from '@quantum/contracts/modules/organization/domain';
import type { UpdateOrganizationInput } from '@quantum/contracts/modules/organization/http';

const copy = errorCopy(tenancyErrorMessages);

interface RenameOrganizationFormProps{
    organization: Organization;
    onSaved: () => void;
}

const RenameOrganizationForm = ({ organization, onSaved }: RenameOrganizationFormProps) => {
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
        <SettingsSection title='Rename organization' description='Change the display name of this organization.'>
            <Form form={form} className='flex max-w-md flex-col gap-4'>
                <Field form={form} name='name' label='Name' placeholder='my-organization' />

                <div>
                    <Button type='submit' isPending={form.submitting} isDisabled={!form.isValid}>
                        Save
                        <ArrowRight aria-hidden='true' className='size-4' />
                    </Button>
                </div>
            </Form>
        </SettingsSection>
    );
};

const OrganizationDetails = ({ organization }: { organization: Organization }) => (
    <SettingsSection title='Details' description='Reference information for this organization.'>
        <dl className='flex flex-col'>
            {[
                ['Name', organization.name],
                ['Slug', organization.slug],
                ['Type', organization.isPersonal ? 'Personal' : 'Team'],
                ['Created', new Date(organization.createdAt).toLocaleDateString()]
            ].map(([label, value]) => (
                <div key={label} className='flex justify-between gap-4 border-b border-separator py-3 last:border-0'>
                    <dt className='text-sm text-muted'>{label}</dt>
                    <dd className='font-mono text-[0.8125rem] text-foreground'>{value}</dd>
                </div>
            ))}
        </dl>
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
        <SettingsSection
            title='Delete organization'
            description='Deleting an organization permanently removes it and all of its projects, environments and resources. This action cannot be undone.'
        >
            <div>
                <Button variant='danger' onPress={() => setDeleteOpen(true)}>
                    Delete organization
                </Button>
            </div>

            <DeleteOrganizationDialog
                organization={organization}
                isOpen={deleteOpen}
                onClose={setDeleteOpen}
                onRemoved={() => { clearTenant(); navigate('/applications'); }}
            />
        </SettingsSection>
    );
};

const OrganizationSettings = () => {
    const { current, reload } = useTenancy();

    if(current === null){
        return (
            <PageBody>
                
                <FieldsSkeleton className='mt-10' rows={3} />
            </PageBody>
        );
    }

    return (
        <PageBody>
            <PageHeader
                eyebrow='Settings'
                title='Organization'
                description='Rename the selected organization, review its details, manage registry credentials, or delete it.'
            />

            <div className='mt-10 flex flex-col'>
                <RenameOrganizationForm key={current.id} organization={current} onSaved={reload} />
                <OrganizationDetails organization={current} />
                <RegistrySection key={`registries-${current.id}`} organizationId={current.id} />
                <DangerZone organization={current} />
            </div>
        </PageBody>
    );
};

export default OrganizationSettings;
