import { useState } from 'react';
import { FieldsSkeleton, TableSkeleton } from '@/shared/components/skeletons';
import { useNavigate } from 'react-router-dom';
import { Button, Label, ListBox, ListBoxItem, Select } from '@heroui/react';
import { ArrowRight, FolderGit2 } from 'lucide-react';
import PageBody from '@/shared/components/layout/PageBody';
import PageHeader from '@/shared/components/layout/PageHeader';
import ErrorState from '@/shared/components/ErrorState';
import EmptyState from '@/shared/components/EmptyState';
import CenterState from '@/shared/components/CenterState';
import SettingsSection from '@/shared/components/SettingsSection';
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
import type { CreateRepositoryFormValues } from '@/modules/repository/utils/create-repository-form';
import type { GithubAccount, GithubRepository, RepositoryDetection } from '@quantum/contracts/modules/github/domain';
import type { Project } from '@quantum/contracts/modules/project/domain';

const githubCopy = errorCopy(githubErrorMessages);
const repositoryCopy = errorCopy(repositoryErrorMessages);

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
        icon={FolderGit2}
        title='Connect GitHub'
        description='Connect your GitHub account to import and deploy a repository.'
    >
        <ConnectGithubButton />
    </EmptyState>
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
        <div>
            <div className='flex flex-wrap items-end justify-between gap-4'>
                <div className='min-w-0'>
                    <h2 className='truncate font-mono text-[0.9375rem] text-foreground'>{repository.fullName}</h2>
                    <p className='mt-1 text-[0.8125rem] text-muted'>Configure how this repository is built and run.</p>
                </div>
                <Button variant='secondary' size='sm' onPress={onBack}>Change repository</Button>
            </div>

            <Form form={form} className='mt-6 flex flex-col'>
                <SettingsSection title='Repository' description='What to call it, which branch to deploy, and where it belongs.'>
                    <div className='grid gap-5 sm:grid-cols-2'>
                        <Field form={form} name='alias' label='Alias' placeholder='my-repository' />

                        <Field form={form} name='branch'>
                            {(binding) => (
                                <div className='flex flex-col gap-1.5'>
                                    <Label>Branch</Label>
                                    <Select
                                        aria-label='Branch'
                                        selectedKey={(binding.value as string) === '' ? null : (binding.value as string)}
                                        onSelectionChange={(key) => binding.onChange(String(key))}
                                    >
                                        <Select.Trigger>
                                            <Select.Value />
                                            <Select.Indicator />
                                        </Select.Trigger>

                                        <Select.Popover>
                                            <ListBox>
                                                {repository.branches.map((branch) => (
                                                    <ListBoxItem key={branch} id={branch} textValue={branch}>
                                                        {branch}
                                                    </ListBoxItem>
                                                ))}
                                            </ListBox>
                                        </Select.Popover>
                                    </Select>
                                </div>
                            )}
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
                </SettingsSection>

                <SettingsSection title='Build' description='Detected from the repository. Change anything Quantum got wrong.'>
                    <div className='grid gap-5 sm:grid-cols-2'>
                        <Field form={form} name='framework'>
                            {(binding) => (
                                <div className='flex flex-col gap-1.5'>
                                    <Label>Framework</Label>
                                    <Select
                                        aria-label='Framework'
                                        placeholder='Select a framework'
                                        selectedKey={(binding.value as string) === '' ? null : (binding.value as string)}
                                        onSelectionChange={(key) => binding.onChange(String(key))}
                                    >
                                        <Select.Trigger>
                                            <Select.Value />
                                            <Select.Indicator />
                                        </Select.Trigger>

                                        <Select.Popover>
                                            <ListBox>
                                                {FRAMEWORK_OPTIONS.map((framework) => (
                                                    <ListBoxItem key={framework} id={framework} textValue={framework}>
                                                        {framework}
                                                    </ListBoxItem>
                                                ))}
                                            </ListBox>
                                        </Select.Popover>
                                    </Select>
                                </div>
                            )}
                        </Field>

                        <Field form={form} name='runtime'>
                            {(binding) => (
                                <div className='flex flex-col gap-1.5'>
                                    <Label>Runtime</Label>
                                    <Select
                                        aria-label='Runtime'
                                        placeholder='Select a runtime'
                                        selectedKey={(binding.value as string) === '' ? null : (binding.value as string)}
                                        onSelectionChange={(key) => binding.onChange(String(key))}
                                    >
                                        <Select.Trigger>
                                            <Select.Value />
                                            <Select.Indicator />
                                        </Select.Trigger>

                                        <Select.Popover>
                                            <ListBox>
                                                {RUNTIME_OPTIONS.map((runtime) => (
                                                    <ListBoxItem key={runtime.value} id={runtime.value} textValue={runtime.label}>
                                                        {runtime.label}
                                                    </ListBoxItem>
                                                ))}
                                            </ListBox>
                                        </Select.Popover>
                                    </Select>
                                </div>
                            )}
                        </Field>

                        <Field form={form} name='runtimeVersion' label='Runtime version' placeholder='20' />
                        <Field form={form} name='port' label='Port' type='number' placeholder='3000' />
                    </div>

                    <div className='grid gap-5 sm:grid-cols-3'>
                        <Field form={form} name='installCommand' label='Install command' placeholder='npm install' />
                        <Field form={form} name='buildCommand' label='Build command' placeholder='npm run build' />
                        <Field form={form} name='startCommand' label='Start command' placeholder='npm start' />
                    </div>

                    <div className='grid gap-5 sm:grid-cols-2'>
                        <Field form={form} name='outputDirectory' label='Output directory' placeholder='dist' />
                    </div>
                </SettingsSection>

                <div className='border-t border-border py-6'>
                    <Button type='submit' isPending={form.submitting} isDisabled={!form.isValid}>
                        Create repository
                        <ArrowRight aria-hidden='true' className='size-4' />
                    </Button>
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
            <CenterState className='h-full'>
                <ErrorState
                    title='Could not load projects'
                    description={repositoryCopy(projects.error)}
                    onRetry={projects.refresh}
                />
            </CenterState>
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
        return <TableSkeleton rows={6} columns={2} />;
    }

    if(repositories.error !== undefined){
        return (
            <CenterState className='h-full'>
                <ErrorState
                    title='Could not load GitHub repositories'
                    description={githubCopy(repositories.error)}
                    onRetry={repositories.reload}
                />
            </CenterState>
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
        <PageBody fill>
            <PageHeader
                eyebrow='Applications / Import'
                title='Import a repository'
                description='Pick a repository from your GitHub account. Quantum detects the framework and deploys on every push.'
            />

            <div className='mt-8 flex flex-1 flex-col'>
                {account.loading ? (
                    <TableSkeleton rows={6} columns={2} />
                ) : account.error !== undefined ? (
                    <CenterState><ConnectGithubPrompt /></CenterState>
                ) : (
                    <RepositoryCreateFlow account={account.data} />
                )}
            </div>
        </PageBody>
    );
};

export default CreateRepository;
