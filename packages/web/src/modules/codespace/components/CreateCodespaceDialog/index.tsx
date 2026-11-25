import typia from 'typia';
import SingleFieldDialog from '@/shared/components/SingleFieldDialog';
import { useForm } from '@/shared/hooks/forms/use-form';
import { codespaceApi } from '@/modules/codespace/api/api';
import { codespaceErrorMessages } from '@/modules/codespace/utils/error-messages';
import type { CreateCodespaceInput } from '@quantum/contracts/modules/codespace/http';

interface CreateCodespaceDialogProps{
    projectId: number;
    isOpen: boolean;
    onClose: (isOpen: boolean) => void;
    onCreated: () => void;
}

const CreateCodespaceDialog = ({ projectId, isOpen, onClose, onCreated }: CreateCodespaceDialogProps) => {
    const form = useForm<CreateCodespaceInput>({
        validate: typia.createValidate<CreateCodespaceInput>(),
        submitErrorMessages: codespaceErrorMessages,
        initialValues: { name: '' },
        onSubmit: async (values) => {
            await codespaceApi.create({ path: { projectId }, body: { name: values.name.trim() } });
            onCreated();
            onClose(false);
        }
    });

    return (
        <SingleFieldDialog
            isOpen={isOpen}
            onOpenChange={(open) => { if(!open && !form.submitting) onClose(false); }}
            title='New codespace'
            form={form}
            fieldName='name'
            fieldLabel='Name'
            fieldPlaceholder='my-codespace'
            submitLabel='Create codespace'
            submitDisabled={!form.isValid}
            onCancel={() => onClose(false)}
        />
    );
};

export default CreateCodespaceDialog;
