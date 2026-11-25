import { useState } from 'react';
import { FieldsSkeleton } from '@/shared/components/skeletons';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@heroui/react';
import { Box, FileCode2, SquareTerminal, Trash2, Zap } from 'lucide-react';
import typia from 'typia';
import ErrorState from '@/shared/components/ErrorState';
import SettingsSection, { SettingsBlock } from '@/shared/components/SettingsSection';
import SettingsRow from '@/shared/components/SettingsRow';
import Segmented from '@/shared/components/layout/Segmented';
import DeleteConfirmDialog from '@/shared/components/DeleteConfirmDialog';
import Form from '@/shared/components/forms/Form';
import Field from '@/shared/components/forms/Field';
import PersistentVolumes from '@/modules/repository/components/PersistentVolumes';
import PublishedPorts from '@/modules/repository/components/PublishedPorts';
import { useForm } from '@/shared/hooks/forms/use-form';
import { useQuery } from '@/shared/hooks/api/use-query';
import { repositoryApi } from '@/modules/repository/api/api';
import { BUILD_STRATEGIES, BUILD_STRATEGY_LABELS } from '@/modules/repository/utils/build-strategy';
import { repositoryErrorMessages } from '@/modules/repository/utils/error-messages';
import { errorCopy } from '@/shared/utils/error-copy';
import { BuildStrategy } from '@quantum/contracts/modules/repository/domain';
import type { LucideIcon } from 'lucide-react';
import type { IValidation } from 'typia';
import type { Repository } from '@quantum/contracts/modules/repository/domain';
import type { UpdateRepositoryInput } from '@quantum/contracts/modules/repository/http';

const copy = errorCopy(repositoryErrorMessages);

const BUILD_STRATEGY_ICONS: Record<BuildStrategy, LucideIcon> = {
    [BuildStrategy.Auto]: Zap,
    [BuildStrategy.Dockerfile]: FileCode2,
    [BuildStrategy.PrebuiltImage]: Box,
    [BuildStrategy.Exec]: SquareTerminal
};

const BUILD_STRATEGY_OPTIONS = BUILD_STRATEGIES.map((strategy) => {
    const Icon = BUILD_STRATEGY_ICONS[strategy];

    return {
        value: strategy,
        label: (
            <>
                <Icon aria-hidden='true' />
                {BUILD_STRATEGY_LABELS[strategy]}
            </>
        )
    };
});

interface RepositorySettingsFormValues{
    alias: string;
    branch: string;
    buildCommand: string;
    installCommand: string;
    startCommand: string;
    rootDirectory: string;
    outputDirectory: string;
    framework: string;
    runtime: string;
    runtimeVersion: string;
    port: string;
    buildStrategy: BuildStrategy;
    dockerfilePath: string;
    image: string;
}

const toRepositorySettingsFormValues = (repository: Repository): RepositorySettingsFormValues => ({
    alias: repository.alias,
    branch: repository.branch,
    buildCommand: repository.buildCommand,
    installCommand: repository.installCommand,
    startCommand: repository.startCommand,
    rootDirectory: repository.rootDirectory,
    outputDirectory: repository.outputDirectory ?? '',
    framework: repository.framework ?? '',
    runtime: repository.runtime ?? '',
    runtimeVersion: repository.runtimeVersion ?? '',
    port: repository.port === null ? '' : String(repository.port),
    buildStrategy: repository.buildStrategy,
    dockerfilePath: repository.dockerfilePath ?? '',
    image: repository.image ?? ''
});

const optional = (value: string): string | undefined => {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
};

const toUpdateRepositoryInput = (values: RepositorySettingsFormValues): UpdateRepositoryInput => {
    const alias = optional(values.alias);
    const branch = optional(values.branch);
    const buildCommand = optional(values.buildCommand);
    const installCommand = optional(values.installCommand);
    const startCommand = optional(values.startCommand);
    const rootDirectory = optional(values.rootDirectory);
    const outputDirectory = optional(values.outputDirectory);
    const framework = optional(values.framework);
    const runtime = optional(values.runtime);
    const runtimeVersion = optional(values.runtimeVersion);
    const port = optional(values.port);
    const dockerfilePath = optional(values.dockerfilePath);
    const image = optional(values.image);

    return {
        ...(alias !== undefined ? { alias } : {}),
        ...(branch !== undefined ? { branch } : {}),
        ...(buildCommand !== undefined ? { buildCommand } : {}),
        ...(installCommand !== undefined ? { installCommand } : {}),
        ...(startCommand !== undefined ? { startCommand } : {}),
        ...(rootDirectory !== undefined ? { rootDirectory } : {}),
        ...(outputDirectory !== undefined ? { outputDirectory } : {}),
        ...(framework !== undefined ? { framework } : {}),
        ...(runtime !== undefined ? { runtime } : {}),
        ...(runtimeVersion !== undefined ? { runtimeVersion } : {}),
        ...(port !== undefined ? { port: Number(port) } : {}),
        buildStrategy: values.buildStrategy,
        ...(dockerfilePath !== undefined ? { dockerfilePath } : {}),
        ...(image !== undefined ? { image } : {})
    };
};

const validateInput = typia.createValidate<UpdateRepositoryInput>();

const validateRepositorySettingsForm = (input: unknown): IValidation<RepositorySettingsFormValues> => {
    const values = input as RepositorySettingsFormValues;
    const result = validateInput(toUpdateRepositoryInput(values));
    if(!result.success) return result;
    return { success: true, data: values };
};

interface RepositorySettingsFormProps{
    repository: Repository;
    onSaved: () => void;
}

const RepositorySettingsForm = ({ repository, onSaved }: RepositorySettingsFormProps) => {
    const form = useForm<RepositorySettingsFormValues>({
        validate: validateRepositorySettingsForm,
        submitErrorMessages: repositoryErrorMessages,
        initialValues: toRepositorySettingsFormValues(repository),
        onSubmit: async (values) => {
            await repositoryApi.update({ path: { id: repository.id }, body: toUpdateRepositoryInput(values) });
            onSaved();
        }
    });

    return (
        <Form form={form} className='flex flex-col gap-7'>
            <SettingsSection title='General' description='How this repository is named and which branch is deployed.'>
                <SettingsBlock>
                    <div className='grid gap-4 sm:grid-cols-2'>
                        <Field form={form} name='alias' label='Alias' placeholder='my-repository' />
                        <Field form={form} name='branch' label='Branch' placeholder='main' />
                    </div>
                </SettingsBlock>
            </SettingsSection>

            <SettingsSection title='Build' description='The runtime it runs on and the commands that build and start it.'>
                <SettingsBlock>
                    <div className='grid gap-4 sm:grid-cols-2'>
                        <Field form={form} name='framework' label='Framework' placeholder='Next.js' />
                        <Field form={form} name='runtime' label='Runtime' placeholder='node' />
                        <Field form={form} name='runtimeVersion' label='Runtime version' placeholder='20' />
                        <Field form={form} name='port' label='Port' type='number' placeholder='3000' />
                    </div>

                    <div className='grid gap-4 sm:grid-cols-3'>
                        <Field form={form} name='installCommand' label='Install command' placeholder='npm install' />
                        <Field form={form} name='buildCommand' label='Build command' placeholder='npm run build' />
                        <Field form={form} name='startCommand' label='Start command' placeholder='npm start' />
                    </div>

                    <div className='grid gap-4 sm:grid-cols-2'>
                        <Field form={form} name='rootDirectory' label='Root directory' placeholder='/' />
                        <Field form={form} name='outputDirectory' label='Output directory' placeholder='dist' />
                    </div>
                </SettingsBlock>
            </SettingsSection>

            <SettingsSection title='Build strategy' description='Let Quantum detect the build, or point it at a Dockerfile or a prebuilt image.'>
                <SettingsBlock>
                    <Field form={form} name='buildStrategy'>
                        {(binding) => (
                            <Segmented
                                label='Build strategy'
                                options={BUILD_STRATEGY_OPTIONS}
                                value={binding.value as BuildStrategy}
                                isDisabled={form.submitting}
                                onChange={binding.onChange}
                            />
                        )}
                    </Field>

                    {form.values.buildStrategy === BuildStrategy.Dockerfile && (
                        <Field form={form} name='dockerfilePath' label='Dockerfile path' placeholder='Dockerfile' />
                    )}

                    {form.values.buildStrategy === BuildStrategy.PrebuiltImage && (
                        <Field form={form} name='image' label='Image' placeholder='registry.example.com/app:latest' />
                    )}
                </SettingsBlock>
            </SettingsSection>

            <div>
                <Button type='submit' isPending={form.submitting} isDisabled={!form.isValid}>Save changes</Button>
            </div>
        </Form>
    );
};

interface DeleteRepositoryDialogProps{
    repository: Repository;
    isOpen: boolean;
    onClose: (isOpen: boolean) => void;
    onRemoved: () => void;
}

const DeleteRepositoryDialog = ({ repository, isOpen, onClose, onRemoved }: DeleteRepositoryDialogProps) => (
    <DeleteConfirmDialog
        isOpen={isOpen}
        title='Delete repository'
        description={`This permanently removes ${repository.alias} and its deployments. This action cannot be undone.`}
        entityId={repository.id}
        remove={(repositoryId) => repositoryApi.remove({ path: { id: repositoryId } })}
        getErrorMessage={copy}
        onClose={() => onClose(false)}
        onRemoved={onRemoved}
    />
);

const DangerZone = ({ repository }: { repository: Repository }) => {
    const navigate = useNavigate();
    const [deleteOpen, setDeleteOpen] = useState(false);

    return (
        <SettingsSection title='Delete repository'>
            {/* Drawn over the card's hairline so the whole card reads as destructive. */}
            <div className='-m-px rounded-lg border border-danger/30'>
                <SettingsRow
                    title={`Delete ${repository.alias}`}
                    description='Permanently removes the repository and all of its deployments. This cannot be undone.'
                    action={(
                        <Button variant='danger' onPress={() => setDeleteOpen(true)}>
                            <Trash2 aria-hidden='true' />
                            Delete repository
                        </Button>
                    )}
                />
            </div>

            <DeleteRepositoryDialog
                repository={repository}
                isOpen={deleteOpen}
                onClose={setDeleteOpen}
                onRemoved={() => navigate('/applications')}
            />
        </SettingsSection>
    );
};

const RepositorySettings = () => {
    const { repositoryId } = useParams<{ repositoryId: string }>();
    const id = repositoryId !== undefined ? Number(repositoryId) : undefined;

    const repository = useQuery((repositoryId: number) => repositoryApi.get({ path: { id: repositoryId } }), [id]);

    if(repository.loading) return <FieldsSkeleton rows={5} />;
    if(repository.error !== undefined){
        return (
            <ErrorState
                title='Could not load repository'
                description={copy(repository.error)}
                onRetry={repository.reload}
            />
        );
    }
    if(repository.data === null) return null;

    return (
        <div className='flex w-full max-w-[46rem] flex-col gap-7'>
            <RepositorySettingsForm
                key={repository.data.id}
                repository={repository.data}
                onSaved={repository.reload}
            />
            <PersistentVolumes key={`volumes-${repository.data.id}`} repository={repository.data} onSaved={repository.reload} />
            <PublishedPorts ports={repository.data.ports} />
            <DangerZone repository={repository.data} />
        </div>
    );
};

export default RepositorySettings;
