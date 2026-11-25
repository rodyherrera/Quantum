import { Button } from '@heroui/react';
import typia from 'typia';
import Form from '@/shared/components/forms/Form';
import Field from '@/shared/components/forms/Field';
import { useForm } from '@/shared/hooks/forms/use-form';
import { organizationApi } from '@/modules/organization/api/api';
import { tenancyErrorMessages } from '@/modules/organization/utils/error-messages';
import { useTenantStore } from '@/shared/store/tenant';
import type { CreateOrganizationInput } from '@quantum/contracts/modules/organization/http';

interface CreateOrganizationFormProps{
    onCreated: () => void;
}

const CreateOrganizationForm = ({ onCreated }: CreateOrganizationFormProps) => {
    const setOrganizationId = useTenantStore((state) => state.setOrganizationId);

    const form = useForm<CreateOrganizationInput>({
        validate: typia.createValidate<CreateOrganizationInput>(),
        submitErrorMessages: tenancyErrorMessages,
        initialValues: { name: '' },
        onSubmit: async (values) => {
            const organization = await organizationApi.create({ body: values });
            setOrganizationId(organization.id);
            onCreated();
        }
    });

    return (
        <Form form={form} className='flex w-full flex-col gap-3.5'>
            <Field form={form} name='name' label='Organization name' placeholder='Acme Inc.' />

            <Button type='submit' fullWidth isPending={form.submitting}>Create organization</Button>
        </Form>
    );
};

export default CreateOrganizationForm;
