import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Button, Input, TextField } from '@heroui/react';
import PageBar from '@/shared/components/layout/PageBar';
import PageBody from '@/shared/components/layout/PageBody';
import PageIntro from '@/shared/components/layout/PageIntro';
import Segmented from '@/shared/components/layout/Segmented';
import SettingsSection, { SettingsBlock } from '@/shared/components/SettingsSection';
import SettingsRow from '@/shared/components/SettingsRow';
import EntitySelect from '@/shared/components/EntitySelect';
import InlineError from '@/shared/components/InlineError';
import EmptyState from '@/shared/components/EmptyState';
import MonacoEditor from '@/shared/components/MonacoEditor';
import { FieldsSkeleton } from '@/shared/components/skeletons';
import ConnectGithubButton from '@/modules/github/components/ConnectGithubButton';
import GenerateSecretButton from '@/shared/components/forms/GenerateSecretButton';
import RepositoryPicker from '@/modules/github/components/RepositoryPicker';
import { useResource } from '@/shared/hooks/api/use-resource';
import { useQuery } from '@/shared/hooks/api/use-query';
import { useMutation } from '@/shared/hooks/api/use-mutation';
import { templateInstallApi } from '@/modules/template/api/api';
import { githubApi } from '@/modules/github/api/api';
import { projectRoutes } from '@quantum/contracts/modules/project/routes';
import { useCurrentOrganizationId } from '@/modules/organization/hooks/use-current-organization-id';
import { composeErrorMessage } from '@/modules/template/utils/compose-error';
import { COMPOSE_STARTER } from '@/modules/template/utils/compose-starter';
import { DEPLOY_TRIGGERS, deployTriggerLabel } from '@/modules/template/utils/deploy-trigger';
import { isSecretVariable } from '@/shared/utils/secret-variable';
import type { ReactNode } from 'react';
import type { SegmentedOption } from '@/shared/components/layout/Segmented';
import type { GithubRepository } from '@quantum/contracts/modules/github/domain';
import type { Project } from '@quantum/contracts/modules/project/domain';
import type { ComposeVariable, StackDeployTrigger } from '@quantum/contracts/modules/template/domain';
import type { CreateComposeInstallInput, CreateSourceInstallInput } from '@quantum/contracts/modules/template/http';

type Mode = 'repository' | 'paste';

const SOURCES: SegmentedOption<Mode>[] = [
    { value: 'repository', label: 'From a repository' },
    { value: 'paste', label: 'Paste a compose file' }
];

const CONTROL = 'w-64 max-w-full';

const summarize = (parts: Array<string | null>): string => parts.filter((part) => part !== null).join(' · ');

const Key = ({ children }: { children: string }) => <code className='font-mono text-muted'>{children}</code>;

const StackBody = ({ children }: { children: ReactNode }) => (
    <PageBody variant='narrow' className='flex flex-col gap-7 pb-10 pt-7'>{children}</PageBody>
);

interface DeployBarProps{
    summary: string;
    isPending: boolean;
    isDisabled: boolean;
    onDeploy: () => void;
}

const DeployBar = ({ summary, isPending, isDisabled, onDeploy }: DeployBarProps) => (
    <div className='sticky bottom-0 z-10 mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-separator bg-background/90 px-5 py-2.5 backdrop-blur-sm sm:px-7'>
        <p className='min-w-0 flex-1 truncate text-muted'>{summary}</p>
        <Button isPending={isPending} isDisabled={isDisabled} onPress={onDeploy}>
            Deploy stack
        </Button>
    </div>
);

interface NameRowProps{
    value: string;
    onChange: (name: string) => void;
    isDisabled: boolean;
    placeholder?: string;
}

const NameRow = ({ value, onChange, isDisabled, placeholder }: NameRowProps) => (
    <SettingsRow
        title='Name'
        action={(
            <TextField aria-label='Name' value={value} onChange={onChange} isDisabled={isDisabled} validationBehavior='aria' fullWidth className={CONTROL}>
                <Input placeholder={placeholder} autoComplete='off' />
            </TextField>
        )}
    />
);

interface ProjectRowProps{
    projects: Project[];
    loading: boolean;
    value: number | null;
    onChange: (projectId: number) => void;
    isDisabled: boolean;
}

const ProjectRow = ({ projects, loading, value, onChange, isDisabled }: ProjectRowProps) => (
    <SettingsRow
        title='Project'
        action={(
            <div className={CONTROL}>
                <EntitySelect
                    items={projects}
                    getKey={(project) => project.id}
                    getLabel={(project) => project.name}
                    value={value}
                    onChange={(key) => onChange(Number(key))}
                    placeholder='Select a project'
                    ariaLabel='Project'
                    isDisabled={isDisabled || loading}
                    emptyLabel='This organization has no projects yet'
                />
            </div>
        )}
    >
        {!loading && projects.length === 0 ? (
            <p className='text-muted'>
                A stack deploys into a project, and this organization has none yet.{' '}
                <RouterLink to='/projects' className='text-foreground underline underline-offset-4 hover:no-underline'>
                    Create one in Projects
                </RouterLink>
                .
            </p>
        ) : undefined}
    </SettingsRow>
);

interface VariableRowProps{
    variable: ComposeVariable;
    value: string;
    onChange: (value: string) => void;
    isDisabled: boolean;
}

const VariableRow = ({ variable, value, onChange, isDisabled }: VariableRowProps) => (
    <SettingsRow
        title={<code className='font-mono text-xs'>{variable.name}</code>}
        description={variable.required ? 'Required' : 'Optional'}
        action={(
            <div className={`flex items-center gap-1 ${CONTROL}`}>
                <TextField aria-label={variable.name} value={value} onChange={onChange} isDisabled={isDisabled} validationBehavior='aria' fullWidth>
                    <Input className='font-mono' autoComplete='off' placeholder={variable.required ? '' : 'Has a default in the file'} />
                </TextField>
                {isSecretVariable(variable.name) && <GenerateSecretButton name={variable.name} isDisabled={isDisabled} onGenerate={onChange} />}
            </div>
        )}
    />
);

interface StackFormProps{
    projects: Project[];
    projectsLoading: boolean;
    projectId: number | null;
    onProjectChange: (projectId: number) => void;
}

interface SourceFormProps extends StackFormProps{
    repository: GithubRepository;
    onBack: () => void;
}

const SourceForm = ({ repository, onBack, projects, projectsLoading, projectId, onProjectChange }: SourceFormProps) => {
    const navigate = useNavigate();
    const [name, setName] = useState(repository.name);
    const [branch, setBranch] = useState(repository.defaultBranch);
    const [composePath, setComposePath] = useState('');
    const [deployOn, setDeployOn] = useState<StackDeployTrigger>('push');
    const [values, setValues] = useState<Record<string, string>>({});

    const inspection = useQuery(
        (owner: string, repo: string, ref: string, file: string) =>
            templateInstallApi.inspectSource({ body: { owner, repo, branch: ref, ...(file === '' ? {} : { composePath: file }) } }),
        [repository.owner, repository.name, branch, composePath]
    );
    const deploy = useMutation((targetProjectId: number, body: CreateSourceInstallInput) =>
        templateInstallApi.createFromSource({ path: { projectId: targetProjectId }, body }));

    const found = inspection.data;
    const chosen = found?.composePath ?? null;
    const missing = (found?.variables ?? []).filter((variable) => variable.required && (values[variable.name] ?? '').trim() === '');
    const ready = projectId !== null && name.trim() !== '' && chosen !== null && found?.problem === null && missing.length === 0;
    const project = projects.find((entry) => entry.id === projectId);

    const handleDeploy = async () => {
        if(projectId === null || chosen === null || !ready) return;
        const variables = Object.fromEntries(Object.entries(values).filter(([, value]) => value.trim() !== ''));
        const created = await deploy
            .run(projectId, { name: name.trim(), owner: repository.owner, repo: repository.name, branch, composePath: chosen, deployOn, variables })
            .then((install) => install ?? null, () => null);
        if(created !== null) navigate(`/installs/${created.id}/services`);
    };

    return (
        <>
            <StackBody>
                <SettingsSection title='Repository' description='Where the compose file lives. Quantum reads it from this branch on every deploy.'>
                    <SettingsRow
                        title={(
                            <span className='flex min-w-0 items-center gap-2'>
                                <span className='truncate font-mono text-xs'>{repository.fullName}</span>
                            </span>
                        )}
                        description={repository.private ? 'Private repository' : 'Public repository'}
                        action={<Button size='sm' variant='secondary' onPress={onBack}>Pick another</Button>}
                    />

                    <NameRow value={name} onChange={setName} isDisabled={deploy.loading} />

                    <ProjectRow projects={projects} loading={projectsLoading} value={projectId} onChange={onProjectChange} isDisabled={deploy.loading} />

                    <SettingsRow
                        title='Branch'
                        action={(
                            <div className={CONTROL}>
                                <EntitySelect
                                    items={repository.branches}
                                    getKey={(entry) => entry}
                                    getLabel={(entry) => entry}
                                    value={branch}
                                    onChange={(key) => { setBranch(String(key)); setComposePath(''); }}
                                    ariaLabel='Branch'
                                    isDisabled={deploy.loading}
                                />
                            </div>
                        )}
                    />
                </SettingsSection>

                <SettingsSection title='Compose file' description='Services with build: are built from the repository on the server; the rest pull their image.'>
                    {inspection.loading && <SettingsBlock><FieldsSkeleton rows={1} /></SettingsBlock>}

                    {inspection.error !== undefined && <SettingsBlock><InlineError>{composeErrorMessage(inspection.error)}</InlineError></SettingsBlock>}

                    {found !== null && found !== undefined && found.composeFiles.length === 0 && (
                        <SettingsBlock>
                            <InlineError>{`No compose file at the root of ${branch}. Quantum looks for compose.yaml, docker-compose.yml and their variants.`}</InlineError>
                        </SettingsBlock>
                    )}

                    {found !== null && found !== undefined && found.composeFiles.length > 0 && (
                        <SettingsRow
                            title='File'
                            action={(
                                <div className={CONTROL}>
                                    <EntitySelect
                                        items={found.composeFiles}
                                        getKey={(entry) => entry}
                                        getLabel={(entry) => entry}
                                        value={chosen}
                                        onChange={(key) => setComposePath(String(key))}
                                        ariaLabel='Compose file'
                                        isDisabled={deploy.loading}
                                    />
                                </div>
                            )}
                        />
                    )}

                    {found?.problem !== null && found?.problem !== undefined && (
                        <SettingsBlock><InlineError>{composeErrorMessage(new Error(found.problem))}</InlineError></SettingsBlock>
                    )}

                    <SettingsRow
                        title='Deploy on'
                        description='Quantum registers the webhook on GitHub for you; nothing to configure there.'
                        action={(
                            <div className={CONTROL}>
                                <EntitySelect
                                    items={DEPLOY_TRIGGERS}
                                    getKey={(entry) => entry}
                                    getLabel={(entry) => deployTriggerLabel(entry, branch)}
                                    value={deployOn}
                                    onChange={(key) => setDeployOn(key as StackDeployTrigger)}
                                    ariaLabel='Deploy on'
                                    isDisabled={deploy.loading}
                                />
                            </div>
                        )}
                    />
                </SettingsSection>

                {found !== null && found !== undefined && found.variables.length > 0 && (
                    <SettingsSection title='Variables' description='The ${VAR} placeholders the compose file uses. Ones with a default can stay empty.'>
                        {found.variables.map((variable) => (
                            <VariableRow
                                key={variable.name}
                                variable={variable}
                                value={values[variable.name] ?? ''}
                                onChange={(value) => setValues((current) => ({ ...current, [variable.name]: value }))}
                                isDisabled={deploy.loading}
                            />
                        ))}
                    </SettingsSection>
                )}

                {deploy.error !== undefined && <InlineError>{composeErrorMessage(deploy.error)}</InlineError>}
            </StackBody>

            <DeployBar
                summary={summarize([
                    project === undefined ? null : `Into ${project.name}`,
                    `${repository.fullName}@${branch}`,
                    chosen,
                    missing.length === 0 ? null : `${missing.length} ${missing.length === 1 ? 'variable needs' : 'variables need'} a value`
                ])}
                isPending={deploy.loading}
                isDisabled={!ready}
                onDeploy={() => { void handleDeploy(); }}
            />
        </>
    );
};

const FromRepository = (props: StackFormProps) => {
    const account = useQuery(githubApi.account);
    const repositories = useQuery(githubApi.repositories, [], { enabled: account.error === undefined && !account.loading });
    const [selected, setSelected] = useState<GithubRepository | null>(null);

    if(account.loading || (account.error === undefined && repositories.loading)){
        return <StackBody><FieldsSkeleton rows={2} /></StackBody>;
    }

    if(account.error !== undefined){
        return (
            <StackBody>
                <div className='rounded-lg border border-separator bg-surface'>
                    <EmptyState title='Connect GitHub' description='Connect your GitHub account to deploy a stack from one of its repositories.' compact>
                        <ConnectGithubButton />
                    </EmptyState>
                </div>
            </StackBody>
        );
    }

    if(selected === null){
        return (
            <StackBody>
                <div className='rounded-lg border border-separator bg-surface p-4'>
                    <RepositoryPicker repositories={repositories.data ?? []} account={account.data} onSelect={setSelected} />
                </div>
            </StackBody>
        );
    }

    return <SourceForm key={selected.fullName} repository={selected} onBack={() => setSelected(null)} {...props} />;
};

const FromCompose = ({ projects, projectsLoading, projectId, onProjectChange }: StackFormProps) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [compose, setCompose] = useState(COMPOSE_STARTER);
    const deploy = useMutation((targetProjectId: number, body: CreateComposeInstallInput) =>
        templateInstallApi.createCompose({ path: { projectId: targetProjectId }, body }));

    const ready = projectId !== null && name.trim() !== '' && compose.trim() !== '';
    const project = projects.find((entry) => entry.id === projectId);

    const handleDeploy = async () => {
        if(projectId === null || !ready) return;
        const created = await deploy.run(projectId, { name: name.trim(), compose }).then(() => true, () => false);
        if(created) navigate(`/applications?project=${projectId}`);
    };

    return (
        <>
            <StackBody>
                <SettingsSection title='Stack' description='How the stack shows up in Applications.'>
                    <NameRow value={name} onChange={setName} isDisabled={deploy.loading} placeholder='my-stack' />
                    <ProjectRow projects={projects} loading={projectsLoading} value={projectId} onChange={onProjectChange} isDisabled={deploy.loading} />
                </SettingsSection>

                <div className='flex flex-col gap-2.5'>
                    <MonacoEditor
                        value={compose}
                        language='yaml'
                        ariaLabel='Compose file'
                        isDisabled={deploy.loading}
                        onChange={setCompose}
                        header={(
                            <>
                                <span className='font-medium text-foreground'>Compose file</span>
                            </>
                        )}
                    />

                    <p className='flex gap-2 text-xs text-subtle'>
                        <span>
                            <Key>image</Key>, <Key>command</Key>, <Key>environment</Key>, <Key>ports</Key>, <Key>volumes</Key> and <Key>depends_on</Key> are
                            honoured. Published ports are assigned by Quantum, and <Key>build:</Key> needs a repository.
                        </span>
                    </p>

                    {deploy.error !== undefined && <InlineError>{composeErrorMessage(deploy.error)}</InlineError>}
                </div>
            </StackBody>

            <DeployBar
                summary={summarize([project === undefined ? null : `Into ${project.name}`, name.trim() === '' ? 'Name the stack to deploy it' : name.trim()])}
                isPending={deploy.loading}
                isDisabled={!ready}
                onDeploy={() => { void handleDeploy(); }}
            />
        </>
    );
};

const CreateStack = () => {
    const organizationId = useCurrentOrganizationId();
    const projects = useResource(projectRoutes, {
        list: 'listByOrganization',
        request: organizationId === null ? null : { path: { orgId: organizationId } }
    });
    const [projectId, setProjectId] = useState<number | null>(null);
    const [mode, setMode] = useState<Mode>('repository');

    useEffect(() => {
        if(projectId !== null) return;
        const list = projects.data ?? [];
        const pick = list.find((project) => project.isDefault) ?? list[0];
        if(pick !== undefined) setProjectId(pick.id);
    }, [projectId, projects.data]);

    const form = { projects: projects.data ?? [], projectsLoading: projects.loading, projectId, onProjectChange: setProjectId };

    return (
        <>
            <PageBar title='Deploy a stack' trail={[{ label: 'Applications', to: '/applications' }]} />

            <PageBody variant='narrow' className='flex flex-col items-start gap-5 pb-0'>
                <PageIntro
                    title='Deploy a stack'
                    description='Every service in the compose file runs in its own container on a private network for the stack, where the others reach it by name.'
                />
                <Segmented label='Source' options={SOURCES} value={mode} onChange={setMode} />
            </PageBody>

            {mode === 'repository' ? <FromRepository {...form} /> : <FromCompose {...form} />}
        </>
    );
};

export default CreateStack;
