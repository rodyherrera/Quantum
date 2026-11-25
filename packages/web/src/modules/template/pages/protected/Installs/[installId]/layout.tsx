import { Outlet, useParams } from 'react-router-dom';
import { DetailSkeleton } from '@/shared/components/skeletons';
import { Button } from '@heroui/react';
import {
    Boxes,
    CalendarDays,
    FileCode,
    GitBranch,
    KeyRound,
    Layers,
    LayoutTemplate,
    Play,
    RefreshCw,
    RotateCw,
    ScrollText,
    SlidersHorizontal,
    Square,
    SquareTerminal,
    Zap
} from 'lucide-react';
import PageBar from '@/shared/components/layout/PageBar';
import DetailView from '@/shared/components/detail/DetailView';
import DetailHeader from '@/shared/components/detail/DetailHeader';
import TabNav from '@/shared/components/detail/TabNav';
import Property, { PropertyGroup } from '@/shared/components/detail/Property';
import ErrorState from '@/shared/components/ErrorState';
import CenterState from '@/shared/components/CenterState';
import StatusDot from '@/shared/components/StatusDot';
import InlineError from '@/shared/components/InlineError';
import InlineEdit from '@/shared/components/InlineEdit';
import GithubIcon from '@/shared/components/icons/GithubIcon';
import IconTile from '@/modules/template/components/IconTile';
import WorkspaceButton from '@/modules/codespace/components/WorkspaceButton';
import { useQuery } from '@/shared/hooks/api/use-query';
import { usePolledQuery } from '@/shared/hooks/api/use-polled-query';
import { useMutation } from '@/shared/hooks/api/use-mutation';
import { templateInstallApi } from '@/modules/template/api/api';
import { installStatusColor, installStatusLabel, isInstallRunning, isInstallTransient } from '@/modules/template/utils/install-status';
import { deployTriggerLabel } from '@/modules/template/utils/deploy-trigger';
import { templateErrorMessages } from '@/modules/template/utils/error-messages';
import { projectHue } from '@/modules/project/utils/project-hue';
import { errorCopy } from '@/shared/utils/error-copy';
import { formatDate } from '@/shared/utils/format-date';
import type { LucideIcon } from 'lucide-react';
import type { TabNavItem } from '@/shared/components/detail/TabNav';
import type { TemplateInstall } from '@quantum/contracts/modules/template/domain';
import type { TemplateInstallOperation } from '@quantum/contracts/modules/template/http';

const copy = errorCopy(templateErrorMessages);

/* Before the stack loads its project is unknown, so the trail stops at Applications. */
const LOADING_TRAIL = [{ label: 'Applications', to: '/applications' }];

const tabsFor = (install: TemplateInstall): TabNavItem[] => [
    { label: 'Services', to: 'services', icon: Boxes, count: install.services.length },
    { label: 'Logs', to: 'logs', icon: ScrollText },
    { label: 'Shell', to: 'shell', icon: SquareTerminal },
    { label: 'Environment', to: 'environment', icon: KeyRound },
    ...(install.compose === null ? [] : [
        { label: 'Compose', to: 'compose', icon: FileCode },
        { label: 'Settings', to: 'settings', icon: SlidersHorizontal }
    ])
];

const kindIcon = (install: TemplateInstall): LucideIcon => (install.compose === null ? LayoutTemplate : Layers);

const SourceLabel = ({ install }: { install: TemplateInstall }) => {
    if(install.source !== null){
        return (
            <span className='inline-flex min-w-0 items-center gap-1.5'>
                <GithubIcon className='size-3.5 text-subtle' />
                <span className='truncate'>{install.source.owner}/{install.source.repo}</span>
            </span>
        );
    }

    const Icon = install.compose === null ? LayoutTemplate : FileCode;
    return (
        <span className='inline-flex items-center gap-1.5'>
            <Icon aria-hidden='true' className='size-3.5 text-subtle' />
            {install.compose === null ? 'Template' : 'Docker Compose'}
        </span>
    );
};

interface InstallHeaderProps{
    install: TemplateInstall;
    isOperating: boolean;
    isRedeploying: boolean;
    redeployError: Error | undefined;
    renameError: Error | undefined;
    onOperate: (operation: TemplateInstallOperation) => void;
    onRedeploy: () => void;
    onRename: (name: string) => Promise<unknown>;
}

const InstallHeader = ({ install, isOperating, isRedeploying, redeployError, renameError, onOperate, onRedeploy, onRename }: InstallHeaderProps) => {
    const running = isInstallRunning(install.status);
    const busy = isOperating || isInstallTransient(install.status);
    const published = install.services.filter((service) => service.ports.length > 0).length;
    const KindIcon = kindIcon(install);

    return (
        <DetailHeader
            icon={<IconTile hue={projectHue(install.projectId)}><KindIcon /></IconTile>}
            title={(
                <InlineEdit
                    value={install.name}
                    ariaLabel='Stack name'
                    onCommit={onRename}
                    className='-mx-1 rounded px-1 transition-colors hover:bg-default focus-visible:ring-1 focus-visible:ring-accent motion-reduce:transition-none'
                />
            )}
            error={renameError !== undefined ? <InlineError>{copy(renameError)}</InlineError> : undefined}
            meta={(
                <>
                    <StatusDot
                        color={installStatusColor(install.status)}
                        label={installStatusLabel(install.status)}
                        isTransient={isInstallTransient(install.status)}
                    />
                    <SourceLabel install={install} />
                    {install.source !== null && (
                        <span className='inline-flex items-center gap-1.5'>
                            <GitBranch aria-hidden='true' className='size-3.5 text-subtle' />
                            <span className='font-mono text-xs'>{install.source.branch}</span>
                        </span>
                    )}
                    <span>
                        {install.services.length} {install.services.length === 1 ? 'service' : 'services'} · {published} published
                    </span>
                </>
            )}
            actions={(
                <>
                    <div className='flex flex-wrap items-start gap-1.5'>
                        <WorkspaceButton target={{ kind: 'install', id: install.id }} />
                        <Button variant='secondary' isDisabled={running || busy} onPress={() => onOperate('start')}>
                            <Play aria-hidden='true' />
                            Start
                        </Button>
                        <Button variant='secondary' isDisabled={!running || busy} onPress={() => onOperate('stop')}>
                            <Square aria-hidden='true' />
                            Stop
                        </Button>
                        <Button variant='secondary' isDisabled={busy} onPress={() => onOperate('restart')}>
                            <RotateCw aria-hidden='true' />
                            Restart
                        </Button>
                        <Button isDisabled={busy} isPending={isRedeploying} onPress={onRedeploy}>
                            <RefreshCw aria-hidden='true' />
                            Redeploy
                        </Button>
                    </div>
                    {redeployError !== undefined && <InlineError>{copy(redeployError)}</InlineError>}
                </>
            )}
        />
    );
};

const InstallProperties = ({ install }: { install: TemplateInstall }) => {
    const { source } = install;
    const published = install.services.flatMap((service) => service.ports.map((port) => ({ service: service.name, port })));

    return (
        <>
            <PropertyGroup title='Properties'>
                <Property label='Status'>
                    <StatusDot
                        color={installStatusColor(install.status)}
                        label={installStatusLabel(install.status)}
                        isTransient={isInstallTransient(install.status)}
                    />
                </Property>
                <Property label='Source'>
                    {source === null ? <SourceLabel install={install} /> : (
                        <a
                            href={`https://github.com/${source.owner}/${source.repo}`}
                            target='_blank'
                            rel='noreferrer'
                            className='flex min-w-0 items-center gap-1.5 hover:underline'
                        >
                            <GithubIcon className='size-3.5 shrink-0 text-subtle' />
                            <span className='truncate'>{source.owner}/{source.repo}</span>
                        </a>
                    )}
                </Property>
                {source !== null && (
                    <>
                        <Property label='Branch'>
                            <GitBranch aria-hidden='true' />
                            <span className='truncate font-mono text-xs font-normal'>{source.branch}</span>
                        </Property>
                        <Property label='Compose file'>
                            <FileCode aria-hidden='true' />
                            <span className='truncate font-mono text-xs font-normal'>{source.composePath}</span>
                        </Property>
                        <Property label='Deploy on'>
                            <Zap aria-hidden='true' />
                            <span className='truncate'>{deployTriggerLabel(source.deployOn, source.branch)}</span>
                        </Property>
                    </>
                )}
                <Property label='Created'>
                    <CalendarDays aria-hidden='true' />
                    <time dateTime={install.createdAt} className='truncate'>{formatDate(install.createdAt)}</time>
                </Property>
            </PropertyGroup>

            <PropertyGroup title='Network'>
                <Property label='Services'>
                    <Boxes aria-hidden='true' />
                    {install.services.length}
                </Property>
                <Property label='Published'>
                    {published.length === 0 ? <span className='font-normal text-subtle'>None</span> : (
                        <ul className='flex w-full min-w-0 flex-col gap-1 py-1.5'>
                            {published.map(({ service, port }) => (
                                <li key={`${service}:${port.externalPort}`} className='flex min-w-0 items-baseline justify-between gap-2'>
                                    <span className='truncate font-normal text-muted'>{service}</span>
                                    <span className='shrink-0 font-mono text-xs font-normal'>:{port.externalPort} → {port.internalPort}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Property>
            </PropertyGroup>
        </>
    );
};

const InstallLayout = () => {
    const { installId } = useParams<{ installId: string }>();
    const id = installId !== undefined ? Number(installId) : undefined;

    const query = useQuery((templateInstallId: number) => templateInstallApi.get({ path: { id: templateInstallId } }), [id]);
    const install = usePolledQuery(query, { while: (data) => isInstallTransient(data.status), everyMs: 4000 });

    const operate = useMutation((templateInstallId: number, operation: TemplateInstallOperation) =>
        templateInstallApi.operate({ path: { id: templateInstallId }, body: { operation } }), {
        onSuccess: () => install.reload()
    });
    const redeploy = useMutation((templateInstallId: number) => templateInstallApi.redeploy({ path: { id: templateInstallId } }), {
        onSuccess: () => install.reload()
    });
    const rename = useMutation((templateInstallId: number, name: string) => templateInstallApi.update({ path: { id: templateInstallId }, body: { name } }), {
        onSuccess: () => install.reload()
    });

    if(install.loading){
        return (
            <>
                <PageBar title='Stack' icon={Layers} trail={LOADING_TRAIL} />
                <DetailSkeleton actions={5} tabs={4} />
            </>
        );
    }

    if(install.error !== undefined){
        return (
            <>
                <PageBar title='Stack' icon={Layers} trail={LOADING_TRAIL} />
                <CenterState>
                    <ErrorState title='Could not load the install' description={copy(install.error)} onRetry={install.reload} />
                </CenterState>
            </>
        );
    }

    if(install.data === null || id === undefined) return null;

    return (
        <>
            <PageBar
                title={install.data.name}
                icon={kindIcon(install.data)}
                trail={[{ label: 'Applications', to: `/applications?project=${install.data.projectId}` }]}
            />

            <DetailView
                header={(
                    <InstallHeader
                        install={install.data}
                        isOperating={operate.loading}
                        isRedeploying={redeploy.loading}
                        redeployError={redeploy.error}
                        renameError={rename.error}
                        onOperate={(operation) => { void operate.run(id, operation).catch(() => undefined); }}
                        onRedeploy={() => { void redeploy.run(id).catch(() => undefined); }}
                        onRename={(name) => rename.run(id, name)}
                    />
                )}
                tabs={<TabNav label='Install' items={tabsFor(install.data)} />}
                rail={<InstallProperties install={install.data} />}
            >
                <Outlet context={install.data} />
            </DetailView>
        </>
    );
};

export default InstallLayout;
