import typia from 'typia';
import SingleFieldDialog from '@/shared/components/SingleFieldDialog';
import { useForm } from '@/shared/hooks/forms/use-form';
import { projectApi } from '@/modules/project/api/api';
import { projectErrorMessages } from '@/modules/project/utils/error-messages';
import type { CreateProjectInput } from '@quantum/contracts/modules/project/http';

interface CreateProjectDialogProps{
    organizationId: number;
    isOpen: boolean;
    onClose: (isOpen: boolean) => void;
    onCreated: () => void;
}

const CreateProjectDialog = ({ organizationId, isOpen, onClose, onCreated }: CreateProjectDialogProps) => {
    const form = useForm<CreateProjectInput>({
        validate: typia.createValidate<CreateProjectInput>(),
        submitErrorMessages: projectErrorMessages,
        initialValues: { name: '' },
        onSubmit: async (values) => {
            await projectApi.create({ path: { orgId: organizationId }, body: { name: values.name.trim() } });
            onCreated();
            onClose(false);
        }
    });

    return (
        <SingleFieldDialog
            isOpen={isOpen}
            onOpenChange={(open) => { if(!open && !form.submitting) onClose(false); }}
            title='New project'
            description='Projects group related applications.'
            form={form}
            fieldName='name'
            fieldLabel='Project name'
            fieldPlaceholder='Marketing'
            submitLabel='Create project'
            submitDisabled={!form.isValid}
            onCancel={() => onClose(false)}
        />
    );
};

export default CreateProjectDialog;
