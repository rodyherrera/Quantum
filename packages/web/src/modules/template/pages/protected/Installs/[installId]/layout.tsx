import { Outlet, useParams } from 'react-router-dom';
import { DetailSkeleton } from '@/shared/components/skeletons';
import { Button } from '@heroui/react';
import PageBar from '@/shared/components/layout/PageBar';
import DetailView from '@/shared/components/detail/DetailView';
import DetailHeader from '@/shared/components/detail/DetailHeader';
import TabNav from '@/shared/components/detail/TabNav';
import Property, { PropertyGroup } from '@/shared/components/detail/Property';
import ErrorState from '@/shared/components/ErrorState';
import CenterState from '@/shared/components/CenterState';
import StatusText from '@/shared/components/StatusText';
import InlineError from '@/shared/components/InlineError';
import InlineEdit from '@/shared/components/InlineEdit';
import WorkspaceButton from '@/modules/codespace/components/WorkspaceButton';
import { PortLink } from '@/modules/repository/components/PortLinks';
import { usePublicHost } from '@/shared/hooks/use-public-host';
import { useQuery } from '@/shared/hooks/api/use-query';
import { usePolledQuery } from '@/shared/hooks/api/use-polled-query';
import { useMutation } from '@/shared/hooks/api/use-mutation';
import { templateInstallApi } from '@/modules/template/api/api';
import { installStatusColor, installStatusLabel, isInstallRunning, isInstallTransient } from '@/modules/template/utils/install-status';
import { deployTriggerLabel } from '@/modules/template/utils/deploy-trigger';
import { templateErrorMessages } from '@/modules/template/utils/error-messages';
import { errorCopy } from '@/shared/utils/error-copy';
import { formatDate } from '@/shared/utils/format-date';
import type { TabNavItem } from '@/shared/components/detail/TabNav';
import type { TemplateInstall } from '@quantum/contracts/modules/template/domain';
import type { TemplateInstallOperation } from '@quantum/contracts/modules/template/http';

const copy = errorCopy(templateErrorMessages);

/* Before the stack loads its project is unknown, so the trail stops at Applications. */
const LOADING_TRAIL = [{ label: 'Applications', to: '/applications' }];

const tabsFor = (install: TemplateInstall): TabNavItem[] => [
    { label: 'Services', to: 'services', count: install.services.length },
    { label: 'Logs', to: 'logs' },
    { label: 'Shell', to: 'shell' },
    { label: 'Environment', to: 'environment' },
    ...(install.compose === null ? [] : [
        { label: 'Compose', to: 'compose' },
        { label: 'Settings', to: 'settings' }
    ])
];

const sourceLabel = (install: TemplateInstall): string => {
    if(install.source !== null) return `${install.source.owner}/${install.source.repo}`;
    return install.compose === null ? 'Template' : 'Docker Compose';
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

    return (
        <DetailHeader
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
                    <StatusText color={installStatusColor(install.status)} label={installStatusLabel(install.status)} />
                    <span className='truncate'>{sourceLabel(install)}</span>
                    {install.source !== null && <span className='font-mono text-xs'>{install.source.branch}</span>}
                    <span>
                        {install.services.length} {install.services.length === 1 ? 'service' : 'services'} · {published} published
                    </span>
                </>
            )}
            actions={(
                <>
                    <div className='flex flex-wrap items-start gap-1.5'>
                        <WorkspaceButton target={{ kind: 'install', id: install.id }} />
                        <Button variant='secondary' isDisabled={running || busy} onPress={() => onOperate('start')}>Start</Button>
                        <Button variant='secondary' isDisabled={!running || busy} onPress={() => onOperate('stop')}>Stop</Button>
                        <Button variant='secondary' isDisabled={busy} onPress={() => onOperate('restart')}>Restart</Button>
                        <Button isDisabled={busy} isPending={isRedeploying} onPress={onRedeploy}>Redeploy</Button>
                    </div>
                    {redeployError !== undefined && <InlineError>{copy(redeployError)}</InlineError>}
                </>
            )}
        />
    );
};

const InstallProperties = ({ install }: { install: TemplateInstall }) => {
    const { source } = install;
    const host = usePublicHost();
    const published = install.services.flatMap((service) => service.ports.map((port) => ({ service: service.name, port })));

    return (
        <>
            <PropertyGroup title='Properties'>
                <Property label='Status'>
                    <StatusText color={installStatusColor(install.status)} label={installStatusLabel(install.status)} />
                </Property>
                <Property label='Source'>
                    {source === null ? sourceLabel(install) : (
                        <a href={`https://github.com/${source.owner}/${source.repo}`} target='_blank' rel='noreferrer' className='truncate underline-offset-2 hover:underline'>
                            {sourceLabel(install)}
                        </a>
                    )}
                </Property>
                {source !== null && (
                    <>
                        <Property label='Branch'>
                            <span className='truncate font-mono text-xs font-normal'>{source.branch}</span>
                        </Property>
                        <Property label='Compose file'>
                            <span className='truncate font-mono text-xs font-normal'>{source.composePath}</span>
                        </Property>
                        <Property label='Deploy on'>
                            <span className='truncate'>{deployTriggerLabel(source.deployOn, source.branch)}</span>
                        </Property>
                    </>
                )}
                <Property label='Created'>
                    <time dateTime={install.createdAt} className='truncate'>{formatDate(install.createdAt)}</time>
                </Property>
            </PropertyGroup>

            <PropertyGroup title='Network'>
                <Property label='Services'>
                    {install.services.length}
                </Property>
                <Property label='Published'>
                    {published.length === 0 ? <span className='font-normal text-subtle'>None</span> : (
                        <ul className='grid min-w-0 grid-cols-[minmax(0,max-content)_auto] items-center justify-items-start gap-x-2 gap-y-1 py-1.5'>
                            {published.map(({ service, port }) => (
                                <li key={`${service}:${port.externalPort}`} className='contents'>
                                    <span className='min-w-0 truncate font-normal text-muted'>{service}</span>
                                    <PortLink host={host} port={port} />
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
                <PageBar title='Stack' trail={LOADING_TRAIL} />
                <DetailSkeleton actions={5} tabs={4} />
            </>
        );
    }

    if(install.error !== undefined){
        return (
            <>
                <PageBar title='Stack' trail={LOADING_TRAIL} />
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
