import { useState } from 'react';
import { BoardSkeleton, PageSkeleton } from '@/shared/components/skeletons';
import { Gauge } from 'lucide-react';
import PageBar from '@/shared/components/layout/PageBar';
import PageBody from '@/shared/components/layout/PageBody';
import Segmented from '@/shared/components/layout/Segmented';
import ListPageShell from '@/shared/components/ListPageShell';
import ListRow from '@/shared/components/list/ListRow';
import StatTile from '@/shared/components/StatTile';
import StatBand from '@/shared/components/StatBand';
import BoardSection from '@/shared/components/board/BoardSection';
import BoardSplit from '@/shared/components/board/BoardSplit';
import MeterList from '@/shared/components/board/MeterList';
import { useQuery } from '@/shared/hooks/api/use-query';
import { dockerApi } from '@/modules/docker/api/api';
import { serverApi } from '@/shared/api/server-api';
import { projectHue } from '@/modules/project/utils/project-hue';
import { formatBytes } from '@/shared/utils/format-bytes';
import { rate, share } from '@/shared/utils/format-metrics';
import type { NetworkUsageStat, ResourceUsageStat } from '@quantum/contracts/modules/docker/domain';

const WINDOWS = [
    { value: 15, label: '15 min' },
    { value: 60, label: '1 hour' },
    { value: 360, label: '6 hours' },
    { value: 1440, label: '24 hours' }
];

interface ProjectUsage{
    projectId: number;
    projectName: string;
    incoming: number;
    outgoing: number;
    avgCpu: number;
    avgMem: number;
    maxMem: number;
}

const joinUsage = (network: NetworkUsageStat[], resources: ResourceUsageStat[]): ProjectUsage[] => {
    const byId = new Map<number, ProjectUsage>();
    const entry = (projectId: number, projectName: string): ProjectUsage => {
        const found = byId.get(projectId) ?? { projectId, projectName, incoming: 0, outgoing: 0, avgCpu: 0, avgMem: 0, maxMem: 0 };
        byId.set(projectId, found);
        return found;
    };

    for(const stat of network) Object.assign(entry(stat.projectId, stat.projectName), { incoming: stat.incoming, outgoing: stat.outgoing });
    for(const stat of resources) Object.assign(entry(stat.projectId, stat.projectName), { avgCpu: stat.avgCpu, avgMem: stat.avgMem, maxMem: stat.maxMem });

    return [...byId.values()].sort((a, b) => (b.incoming + b.outgoing) - (a.incoming + a.outgoing));
};

const ProjectDot = ({ projectId }: { projectId: number }) => (
    <span aria-hidden='true' className='size-2 shrink-0 rounded-[0.15625rem]' style={{ backgroundColor: projectHue(projectId) }} />
);

const COLUMNS = 'grid-cols-[minmax(0,1fr)_4.75rem_4.75rem] sm:grid-cols-[minmax(0,1fr)_5rem_5rem_4.5rem_5.5rem]';

const ProjectsTable = ({ usage }: { usage: ProjectUsage[] }) => (
    <div role='table' aria-label='Usage by project'>
        <div role='row' className={`grid h-8 items-center gap-3 border-b border-separator px-5 text-xs font-medium text-subtle ${COLUMNS}`}>
            <span role='columnheader'>Project</span>
            <span role='columnheader' className='text-right'>In</span>
            <span role='columnheader' className='text-right'>Out</span>
            <span role='columnheader' className='hidden text-right sm:block'>Avg CPU</span>
            <span role='columnheader' className='hidden text-right sm:block'>Peak memory</span>
        </div>

        {usage.map((project) => (
            <ListRow key={project.projectId} className={`px-5 ${COLUMNS}`} to={`/applications?project=${project.projectId}`} label={`Open ${project.projectName}`}>
                <span role='cell' className='flex min-w-0 items-center gap-2'>
                    <ProjectDot projectId={project.projectId} />
                    <span className='truncate font-medium text-foreground'>{project.projectName}</span>
                </span>
                <span role='cell' className='text-right tabular-nums text-foreground'>{formatBytes(project.incoming)}</span>
                <span role='cell' className='text-right tabular-nums text-foreground'>{formatBytes(project.outgoing)}</span>
                <span role='cell' className='hidden text-right tabular-nums text-muted sm:block'>{rate(project.avgCpu)}%</span>
                <span role='cell' className='hidden text-right tabular-nums text-muted sm:block'>{formatBytes(project.maxMem)}</span>
            </ListRow>
        ))}
    </div>
);

const ServerHealth = () => {
    const health = useQuery(serverApi.health, []);
    const data = health.data;
    if(data === null) return null;

    return (
        <div className='mt-6'>
            <h3 className='mb-3 font-medium text-foreground'>Server</h3>
            <MeterList
                max={100}
                entries={[
                    { key: 'cpu', label: 'CPU', value: data.cpuPercent, display: `${rate(data.cpuPercent)}%` },
                    { key: 'memory', label: 'Memory', value: data.ramPercent, display: `${rate(data.ramPercent)}%` }
                ]}
            />
            <p className='mt-2.5 text-xs text-subtle'>{formatBytes(data.memTotal - data.memFree)} of {formatBytes(data.memTotal)} memory in use</p>
        </div>
    );
};

const Usage = () => {
    const [minutes, setMinutes] = useState(60);
    const network = useQuery((query: { minutes?: number }) => dockerApi.networkUsage({ query }), [{ minutes }]);
    const resources = useQuery((query: { minutes?: number }) => dockerApi.resourceUsage({ query }), [{ minutes }]);

    const retry = () => { network.reload(); resources.reload(); };
    const describe = () => 'Something went wrong loading usage data. Please try again.';

    const bar = (
        <PageBar
            title='Usage'
            icon={Gauge}
            actions={<Segmented label='Time window' options={WINDOWS} value={minutes} onChange={setMinutes} />}
        />
    );

    if(network.loading || resources.loading){
        return <PageSkeleton actions={1}><BoardSkeleton stats={4} /></PageSkeleton>;
    }

    const usage = joinUsage(network.data ?? [], resources.data ?? []);
    const incoming = usage.reduce((total, project) => total + project.incoming, 0);
    const outgoing = usage.reduce((total, project) => total + project.outgoing, 0);
    const transferred = incoming + outgoing;
    const peak = [...usage].sort((a, b) => b.maxMem - a.maxMem)[0];
    const busiest = [...usage].sort((a, b) => b.avgCpu - a.avgCpu)[0];

    return (
        <>
            {bar}

            <PageBody variant='flush' fill>
                <ListPageShell
                    error={network.error ?? resources.error}
                    errorTitle='Could not load usage'
                    getErrorDescription={describe}
                    onRetry={retry}
                    isEmpty={usage.length === 0}
                    empty={{
                        icon: Gauge,
                        title: 'No usage yet',
                        description: 'Transfer, CPU and memory per project appear here once your projects have running containers.'
                    }}
                >
                    <StatBand columns={4}>
                        <StatTile label='Transferred in' value={formatBytes(incoming)} hint={`Across ${usage.length} ${usage.length === 1 ? 'project' : 'projects'}`} />
                        <StatTile label='Transferred out' value={formatBytes(outgoing)} hint={`Across ${usage.length} ${usage.length === 1 ? 'project' : 'projects'}`} />
                        <StatTile label='Peak memory' value={formatBytes(peak?.maxMem ?? 0)} hint={peak === undefined ? 'No memory samples' : `Highest of any project · ${peak.projectName}`} />
                        <StatTile
                            label='Busiest project'
                            value={busiest === undefined ? '—' : <><ProjectDot projectId={busiest.projectId} />{busiest.projectName}</>}
                            hint={busiest === undefined ? 'No CPU samples' : `${rate(busiest.avgCpu)}% average CPU`}
                        />
                    </StatBand>

                    <BoardSplit layout='main'>
                        <BoardSection title='Projects' meta={`${usage.length} ${usage.length === 1 ? 'project' : 'projects'}`} flush>
                            <ProjectsTable usage={usage} />
                        </BoardSection>

                        <BoardSection title='Share of transfer' meta='In and out'>
                            <MeterList
                                entries={usage.map((project) => ({
                                    key: String(project.projectId),
                                    label: <><ProjectDot projectId={project.projectId} />{project.projectName}</>,
                                    value: project.incoming + project.outgoing,
                                    display: share(project.incoming + project.outgoing, transferred)
                                }))}
                            />
                            <ServerHealth />
                        </BoardSection>
                    </BoardSplit>
                </ListPageShell>
            </PageBody>
        </>
    );
};

export default Usage;
