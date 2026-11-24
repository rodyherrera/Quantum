import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Button, Input, InputGroup, Label, TextField } from '@heroui/react';
import { ArrowRight, FolderGit2 } from 'lucide-react';
import PageBody from '@/shared/components/layout/PageBody';
import PageHeader from '@/shared/components/layout/PageHeader';
import SettingsSection from '@/shared/components/SettingsSection';
import EntitySelect from '@/shared/components/EntitySelect';
import InlineError from '@/shared/components/InlineError';
import EmptyState from '@/shared/components/EmptyState';
import CenterState from '@/shared/components/CenterState';
import MonacoEditor from '@/shared/components/MonacoEditor';
import { FieldsSkeleton, TableSkeleton } from '@/shared/components/skeletons';
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
import { isSecretVariable } from '@/shared/utils/secret-variable';
import type { GithubRepository } from '@quantum/contracts/modules/github/domain';
import type { Project } from '@quantum/contracts/modules/project/domain';
import type { StackDeployTrigger } from '@quantum/contracts/modules/template/domain';
import type { CreateComposeInstallInput, CreateSourceInstallInput } from '@quantum/contracts/modules/template/http';

type Mode = 'repository' | 'paste';

const MODES: Array<{ key: Mode; label: string }> = [
    { key: 'repository', label: 'From a repository' },
    { key: 'paste', label: 'Paste a compose file' }
];

const TRIGGERS: Array<{ key: StackDeployTrigger; label: (branch: string) => string }> = [
    { key: 'push', label: (branch) => `Every push to ${branch}` },
    { key: 'release', label: () => 'Every published release' }
];

interface ModeSwitchProps{
    mode: Mode;
    onChange: (mode: Mode) => void;
}

const ModeSwitch = ({ mode, onChange }: ModeSwitchProps) => (
    <div role='group' aria-label='Source' className='inline-flex h-10 border border-border'>
        {MODES.map((entry, index) => (
            <button
                key={entry.key}
                type='button'
                aria-pressed={entry.key === mode}
                onClick={() => onChange(entry.key)}
                className={`label-caps px-4 transition-colors motion-reduce:transition-none ${index > 0 ? 'border-l border-border' : ''} ${
                    entry.key === mode ? 'bg-foreground text-background' : 'text-muted hover:text-foreground'
                }`}
            >
                {entry.label}
            </button>
        ))}
    </div>
);

interface ProjectFieldProps{
    projects: Project[];
    loading: boolean;
    value: number | null;
    onChange: (projectId: number) => void;
    isDisabled: boolean;
}

const ProjectField = ({ projects, loading, value, onChange, isDisabled }: ProjectFieldProps) => (
    <div className='flex flex-col gap-1.5'>
        <Label>Project</Label>
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

        {!loading && projects.length === 0 && (
            <p className='text-[0.8125rem] text-muted'>
                A stack deploys into a project, and this organization has none yet.{' '}
                <RouterLink to='/projects' className='text-foreground underline underline-offset-4 hover:no-underline'>
                    Create one in Projects
                </RouterLink>
                .
            </p>
        )}
    </div>
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

    const handleDeploy = async () => {
        if(projectId === null || chosen === null || !ready) return;
        const variables = Object.fromEntries(Object.entries(values).filter(([, value]) => value.trim() !== ''));
        const created = await deploy
            .run(projectId, { name: name.trim(), owner: repository.owner, repo: repository.name, branch, composePath: chosen, deployOn, variables })
            .then((install) => install ?? null, () => null);
        if(created !== null) navigate(`/installs/${created.id}/services`);
    };

    return (
        <div>
            <SettingsSection title='Repository' description='Where the compose file lives. Quantum reads it from this branch on every deploy.'>
                <div className='flex flex-wrap items-center justify-between gap-4'>
                    <code className='font-mono text-[0.8125rem] text-foreground'>{repository.fullName}</code>
                    <Button size='sm' variant='ghost' onPress={onBack}>Pick another</Button>
                </div>

                <TextField value={name} onChange={setName} isDisabled={deploy.loading} validationBehavior='aria' fullWidth>
                    <Label>Name</Label>
                    <Input autoComplete='off' />
                </TextField>

                <ProjectField projects={projects} loading={projectsLoading} value={projectId} onChange={onProjectChange} isDisabled={deploy.loading} />

                <div className='flex flex-col gap-1.5'>
                    <Label>Branch</Label>
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
            </SettingsSection>

            <SettingsSection title='Compose file' description='Services with build: are built from the repository on the server; the rest pull their image.'>
                {inspection.loading && <FieldsSkeleton rows={2} />}

                {inspection.error !== undefined && <InlineError>{composeErrorMessage(inspection.error)}</InlineError>}

                {found !== null && found !== undefined && found.composeFiles.length === 0 && (
                    <InlineError>{`No compose file at the root of ${branch}. Quantum looks for compose.yaml, docker-compose.yml and their variants.`}</InlineError>
                )}

                {found !== null && found !== undefined && found.composeFiles.length > 0 && (
                    <div className='flex flex-col gap-1.5'>
                        <Label>File</Label>
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

                {found?.problem !== null && found?.problem !== undefined && (
                    <InlineError>{composeErrorMessage(new Error(found.problem))}</InlineError>
                )}

                <div className='flex flex-col gap-1.5'>
                    <Label>Deploy on</Label>
                    <EntitySelect
                        items={TRIGGERS}
                        getKey={(entry) => entry.key}
                        getLabel={(entry) => entry.label(branch)}
                        value={deployOn}
                        onChange={(key) => setDeployOn(key as StackDeployTrigger)}
                        ariaLabel='Deploy on'
                        isDisabled={deploy.loading}
                    />
                    <p className='text-[0.8125rem] text-muted'>
                        Quantum registers the webhook on GitHub for you; nothing to configure there.
                    </p>
                </div>
            </SettingsSection>

            {found !== null && found !== undefined && found.variables.length > 0 && (
                <SettingsSection title='Variables' description='The ${VAR} placeholders the compose file uses. Ones with a default can stay empty.'>
                    {found.variables.map((variable) => (
                        <TextField
                            key={variable.name}
                            value={values[variable.name] ?? ''}
                            onChange={(value) => setValues((current) => ({ ...current, [variable.name]: value }))}
                            isDisabled={deploy.loading}
                            validationBehavior='aria'
                            fullWidth
                        >
                            <Label className='font-mono'>{variable.name}{variable.required ? '' : ' (optional)'}</Label>
                            {isSecretVariable(variable.name) ? (
                                <InputGroup fullWidth>
                                    <InputGroup.Input className='font-mono' autoComplete='off' placeholder={variable.required ? '' : 'Has a default in the file'} />
                                    <InputGroup.Suffix>
                                        <GenerateSecretButton
                                            name={variable.name}
                                            isDisabled={deploy.loading}
                                            onGenerate={(value) => setValues((current) => ({ ...current, [variable.name]: value }))}
                                        />
                                    </InputGroup.Suffix>
                                </InputGroup>
                            ) : (
                                <Input className='font-mono' autoComplete='off' placeholder={variable.required ? '' : 'Has a default in the file'} />
                            )}
                        </TextField>
                    ))}
                </SettingsSection>
            )}

            {deploy.error !== undefined && <InlineError className='mt-6'>{composeErrorMessage(deploy.error)}</InlineError>}

            <div className='mt-8 flex justify-end'>
                <Button isPending={deploy.loading} isDisabled={!ready} onPress={() => { void handleDeploy(); }}>
                    Deploy
                    <ArrowRight aria-hidden='true' className='size-4' />
                </Button>
            </div>
        </div>
    );
};

const FromRepository = (props: StackFormProps) => {
    const account = useQuery(githubApi.account);
    const repositories = useQuery(githubApi.repositories, [], { enabled: account.error === undefined && !account.loading });
    const [selected, setSelected] = useState<GithubRepository | null>(null);

    if(account.loading || (account.error === undefined && repositories.loading)) return <TableSkeleton rows={6} columns={2} />;

    if(account.error !== undefined){
        return (
            <CenterState className='py-16'>
                <EmptyState icon={FolderGit2} title='Connect GitHub' description='Connect your GitHub account to deploy a stack from one of its repositories.'>
                    <ConnectGithubButton />
                </EmptyState>
            </CenterState>
        );
    }

    if(selected === null) return <RepositoryPicker repositories={repositories.data ?? []} account={account.data} onSelect={setSelected} />;

    return <SourceForm key={selected.fullName} repository={selected} onBack={() => setSelected(null)} {...props} />;
};

const FromCompose = ({ projects, projectsLoading, projectId, onProjectChange }: StackFormProps) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [compose, setCompose] = useState(COMPOSE_STARTER);
    const deploy = useMutation((targetProjectId: number, body: CreateComposeInstallInput) =>
        templateInstallApi.createCompose({ path: { projectId: targetProjectId }, body }));

    const ready = projectId !== null && name.trim() !== '' && compose.trim() !== '';

    const handleDeploy = async () => {
        if(projectId === null || !ready) return;
        const created = await deploy.run(projectId, { name: name.trim(), compose }).then(() => true, () => false);
        if(created) navigate(`/applications?project=${projectId}`);
    };

    return (
        <div>
            <SettingsSection title='Stack' description='How the stack shows up in Applications.'>
                <TextField value={name} onChange={setName} isDisabled={deploy.loading} validationBehavior='aria' fullWidth>
                    <Label>Name</Label>
                    <Input placeholder='my-stack' autoComplete='off' />
                </TextField>

                <ProjectField projects={projects} loading={projectsLoading} value={projectId} onChange={onProjectChange} isDisabled={deploy.loading} />
            </SettingsSection>

            <SettingsSection
                title='Compose file'
                description='image, command, environment, ports, volumes and depends_on are honoured. Published ports are assigned by Quantum; build: needs a repository.'
            >
                <MonacoEditor value={compose} language='yaml' ariaLabel='Compose file' isDisabled={deploy.loading} onChange={setCompose} />
                {deploy.error !== undefined && <InlineError>{composeErrorMessage(deploy.error)}</InlineError>}
            </SettingsSection>

            <div className='mt-8 flex justify-end'>
                <Button isPending={deploy.loading} isDisabled={!ready} onPress={() => { void handleDeploy(); }}>
                    Deploy
                    <ArrowRight aria-hidden='true' className='size-4' />
                </Button>
            </div>
        </div>
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
        <PageBody>
            <PageHeader eyebrow='Applications' title='Deploy a stack' actions={<ModeSwitch mode={mode} onChange={setMode} />} />

            <div className='mt-10 [&>div>section:first-child]:border-t-0 [&>div>section:first-child]:pt-0'>
                {mode === 'repository' ? <FromRepository {...form} /> : <FromCompose {...form} />}
            </div>
        </PageBody>
    );
};

export default CreateStack;
