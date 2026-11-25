import { useState } from 'react';
import { FieldsSkeleton } from '@/shared/components/skeletons';
import { useNavigate } from 'react-router-dom';
import { Button, Label, ListBox, ListBoxItem, Select } from '@heroui/react';
import PageBar from '@/shared/components/layout/PageBar';
import PageBody from '@/shared/components/layout/PageBody';
import PageIntro from '@/shared/components/layout/PageIntro';
import ErrorState from '@/shared/components/ErrorState';
import EmptyState from '@/shared/components/EmptyState';
import SettingsSection, { SettingsBlock } from '@/shared/components/SettingsSection';
import Form from '@/shared/components/forms/Form';
import Field from '@/shared/components/forms/Field';
import EntitySelect from '@/shared/components/EntitySelect';
import ConnectGithubButton from '@/modules/github/components/ConnectGithubButton';
import RepositoryPicker from '@/modules/github/components/RepositoryPicker';
import { useForm } from '@/shared/hooks/forms/use-form';
import { useQuery } from '@/shared/hooks/api/use-query';
import { useResource } from '@/shared/hooks/api/use-resource';
import { githubApi } from '@/modules/github/api/api';
import { repositoryApi } from '@/modules/repository/api/api';
import { projectRoutes } from '@quantum/contracts/modules/project/routes';
import { useCurrentOrganizationId } from '@/modules/organization/hooks/use-current-organization-id';
import { githubErrorMessages } from '@/modules/github/utils/error-messages';
import { repositoryErrorMessages } from '@/modules/repository/utils/error-messages';
import { errorCopy } from '@/shared/utils/error-copy';
import {
    CREATE_REPOSITORY_INITIAL_VALUES,
    FRAMEWORK_OPTIONS,
    RUNTIME_OPTIONS,
    toCreateRepositoryInput,
    validateCreateRepositoryForm
} from '@/modules/repository/utils/create-repository-form';
import type { IValidation } from 'typia';
import type { FieldBinding } from '@/shared/contracts/form';
import type { CreateRepositoryFormValues } from '@/modules/repository/utils/create-repository-form';
import type { GithubAccount, GithubRepository, RepositoryDetection } from '@quantum/contracts/modules/github/domain';
import type { Project } from '@quantum/contracts/modules/project/domain';

const githubCopy = errorCopy(githubErrorMessages);
const repositoryCopy = errorCopy(repositoryErrorMessages);

const TRAIL = [{ label: 'Applications', to: '/applications' }];

const branchOptions = (repository: GithubRepository) => repository.branches.map((branch) => ({ value: branch, label: branch }));

const FRAMEWORK_CHOICES = FRAMEWORK_OPTIONS.map((framework) => ({ value: framework, label: framework }));

const initialValuesFor = (
    repository: GithubRepository,
    detection: RepositoryDetection | null
): CreateRepositoryFormValues => ({
    ...CREATE_REPOSITORY_INITIAL_VALUES,
    name: repository.name,
    url: repository.htmlUrl,
    alias: repository.name,
    branch: repository.defaultBranch,
    framework: detection?.framework ?? '',
    runtime: detection?.runtime ?? '',
    installCommand: detection?.installCommand ?? '',
    buildCommand: detection?.buildCommand ?? '',
    startCommand: detection?.startCommand ?? '',
    outputDirectory: detection?.outputDirectory ?? '',
    port: detection?.port !== undefined ? String(detection.port) : ''
});

const validateFormValues = (input: unknown): IValidation<CreateRepositoryFormValues> => {
    const result = validateCreateRepositoryForm(input);
    if(!result.success) return result;
    return { success: true, data: input as CreateRepositoryFormValues };
};

const ConnectGithubPrompt = () => (
    <EmptyState
        title='Connect GitHub'
        description='Connect your GitHub account to import and deploy a repository.'
    >
        <ConnectGithubButton />
    </EmptyState>
);

interface OptionSelectProps{
    binding: FieldBinding<unknown>;
    label: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

const OptionSelect = ({ binding, label, options, placeholder }: OptionSelectProps) => (
    <div className='flex flex-col gap-1.5'>
        <Label>{label}</Label>
        <Select
            aria-label={label}
            placeholder={placeholder}
            selectedKey={(binding.value as string) === '' ? null : (binding.value as string)}
            onSelectionChange={(key) => binding.onChange(String(key))}
        >
            <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
            </Select.Trigger>

            <Select.Popover>
                <ListBox>
                    {options.map((option) => (
                        <ListBoxItem key={option.value} id={option.value} textValue={option.label}>
                            {option.label}
                        </ListBoxItem>
                    ))}
                </ListBox>
            </Select.Popover>
        </Select>
    </div>
);

interface SelectedRepositoryProps{
    repository: GithubRepository;
    onBack: () => void;
}

const SelectedRepository = ({ repository, onBack }: SelectedRepositoryProps) => (
    <div className='flex items-center gap-2.5 rounded-lg border border-separator bg-surface py-2 pl-3 pr-2'>
        <span className='min-w-0 flex-1 truncate'>
            <span className='font-medium text-foreground'>{repository.fullName}</span>
            <span className='ml-2 text-subtle'>{repository.private ? 'Private' : 'Public'}</span>
        </span>
        <Button variant='ghost' size='sm' onPress={onBack}>Change repository</Button>
    </div>
);

interface RepositoryConfigFieldsProps{
    repository: GithubRepository;
    detection: RepositoryDetection | null;
    projects: Project[];
    onBack: () => void;
}

const RepositoryConfigFields = ({ repository, detection, projects, onBack }: RepositoryConfigFieldsProps) => {
    const navigate = useNavigate();

    const form = useForm<CreateRepositoryFormValues>({
        validate: validateFormValues,
        submitErrorMessages: repositoryErrorMessages,
        initialValues: initialValuesFor(repository, detection),
        onSubmit: async (values) => {
            const created = await repositoryApi.create({ body: toCreateRepositoryInput(values) });
            navigate(`/repositories/${created.id}/deployments`);
        }
    });

    return (
        <div className='flex flex-col gap-7'>
            <SelectedRepository repository={repository} onBack={onBack} />

            <Form form={form} className='flex flex-col gap-7'>
                <SettingsSection title='Repository' description='What to call it, which branch to deploy, and where it belongs.'>
                    <SettingsBlock>
                        <div className='grid gap-4 sm:grid-cols-2'>
                            <Field form={form} name='alias' label='Alias' placeholder='my-repository' />

                            <Field form={form} name='branch'>
                                {(binding) => <OptionSelect binding={binding} label='Branch' options={branchOptions(repository)} />}
                            </Field>
                        </div>

                        <Field form={form} name='projectId'>
                            {(binding) => (
                                <div className='flex flex-col gap-1.5'>
                                    <Label>Project</Label>
                                    <EntitySelect
                                        items={projects}
                                        getKey={(project) => project.id}
                                        getLabel={(project) => project.name}
                                        value={(binding.value as number) === 0 ? null : (binding.value as number)}
                                        onChange={(key) => binding.onChange(Number(key))}
                                        placeholder='Select a project'
                                        ariaLabel='Project'
                                    />
                                </div>
                            )}
                        </Field>
                    </SettingsBlock>
                </SettingsSection>

                <SettingsSection title='Build' description='Detected from the repository. Change anything Quantum got wrong.'>
                    <SettingsBlock>
                        <div className='grid gap-4 sm:grid-cols-2'>
                            <Field form={form} name='framework'>
                                {(binding) => (
                                    <OptionSelect binding={binding} label='Framework' options={FRAMEWORK_CHOICES} placeholder='Select a framework' />
                                )}
                            </Field>

                            <Field form={form} name='runtime'>
                                {(binding) => (
                                    <OptionSelect binding={binding} label='Runtime' options={RUNTIME_OPTIONS} placeholder='Select a runtime' />
                                )}
                            </Field>

                            <Field form={form} name='runtimeVersion' label='Runtime version' placeholder='20' />
                            <Field form={form} name='port' label='Port' type='number' placeholder='3000' />
                        </div>

                        <div className='grid gap-4 sm:grid-cols-3'>
                            <Field form={form} name='installCommand' label='Install command' placeholder='npm install' />
                            <Field form={form} name='buildCommand' label='Build command' placeholder='npm run build' />
                            <Field form={form} name='startCommand' label='Start command' placeholder='npm start' />
                        </div>

                        <div className='grid gap-4 sm:grid-cols-2'>
                            <Field form={form} name='outputDirectory' label='Output directory' placeholder='dist' />
                        </div>
                    </SettingsBlock>
                </SettingsSection>

                <div>
                    <Button type='submit' isPending={form.submitting} isDisabled={!form.isValid}>Import and deploy</Button>
                </div>
            </Form>
        </div>
    );
};

interface RepositoryConfigFormProps{
    repository: GithubRepository;
    onBack: () => void;
}

const RepositoryConfigForm = ({ repository, onBack }: RepositoryConfigFormProps) => {
    const organizationId = useCurrentOrganizationId();
    const projects = useResource(projectRoutes, {
        list: 'listByOrganization',
        request: organizationId === null ? null : { path: { orgId: organizationId } }
    });
    const detection = useQuery((owner: string, repo: string) => githubApi.detect({ path: { owner, repo } }), [repository.owner, repository.name]);

    if(projects.loading || detection.loading){
        return <FieldsSkeleton rows={4} />;
    }

    if(projects.error !== undefined){
        return (
            <ErrorState
                title='Could not load projects'
                description={repositoryCopy(projects.error)}
                onRetry={projects.refresh}
            />
        );
    }

    return (
        <RepositoryConfigFields
            key={repository.fullName}
            repository={repository}
            detection={detection.data}
            projects={projects.data ?? []}
            onBack={onBack}
        />
    );
};

interface RepositoryCreateFlowProps{
    account: GithubAccount | null;
}

const RepositoryCreateFlow = ({ account }: RepositoryCreateFlowProps) => {
    const repositories = useQuery(githubApi.repositories);
    const [selected, setSelected] = useState<GithubRepository | null>(null);

    if(repositories.loading){
        return <FieldsSkeleton rows={1} />;
    }

    if(repositories.error !== undefined){
        return (
            <ErrorState
                title='Could not load GitHub repositories'
                description={githubCopy(repositories.error)}
                onRetry={repositories.reload}
            />
        );
    }

    if(selected === null){
        return <RepositoryPicker repositories={repositories.data ?? []} account={account} onSelect={setSelected} />;
    }

    return <RepositoryConfigForm repository={selected} onBack={() => setSelected(null)} />;
};

const CreateRepository = () => {
    const account = useQuery(githubApi.account);

    return (
        <>
            <PageBar title='Import a repository' trail={TRAIL} />

            <PageBody variant='narrow'>
                <PageIntro
                    title='Import a repository'
                    description='Pick a repository from your GitHub account. Quantum detects the framework and deploys on every push.'
                />

                <div className='mt-8'>
                    {account.loading ? (
                        <FieldsSkeleton rows={1} />
                    ) : account.error !== undefined ? (
                        <ConnectGithubPrompt />
                    ) : (
                        <RepositoryCreateFlow account={account.data} />
                    )}
                </div>
            </PageBody>
        </>
    );
};

export default CreateRepository;
