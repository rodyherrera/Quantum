import typia from 'typia';
import SingleFieldDialog from '@/shared/components/SingleFieldDialog';
import { useForm } from '@/shared/hooks/forms/use-form';
import { projectApi } from '@/modules/project/api/api';
import { projectErrorMessages } from '@/modules/project/utils/error-messages';
import type { Project } from '@quantum/contracts/modules/project/domain';
import type { UpdateProjectInput } from '@quantum/contracts/modules/project/http';

interface RenameProjectDialogProps{
    project: Project | null;
    onClose: () => void;
    onRenamed: () => void;
}

const RenameProjectDialog = ({ project, onClose, onRenamed }: RenameProjectDialogProps) => {
    const form = useForm<UpdateProjectInput>({
        validate: typia.createValidate<UpdateProjectInput>(),
        submitErrorMessages: projectErrorMessages,
        initialValues: { name: project?.name ?? '' },
        onSubmit: async (values) => {
            if(project === null) return;
            await projectApi.update({ path: { id: project.id }, body: { name: values.name?.trim() } });
            onRenamed();
            onClose();
        }
    });

    const name = form.values.name ?? '';

    return (
        <SingleFieldDialog
            isOpen={project !== null}
            onOpenChange={(isOpen) => { if(!isOpen && !form.submitting) onClose(); }}
            title='Rename project'
            form={form}
            fieldName='name'
            fieldLabel='Project name'
            submitLabel='Save'
            submitDisabled={name.trim() === ''}
            onCancel={onClose}
        />
    );
};

export default RenameProjectDialog;
