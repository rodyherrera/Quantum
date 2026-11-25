import { useMemo } from 'react';
import { BoardSkeleton, PageSkeleton } from '@/shared/components/skeletons';
import { useRememberedSelection } from '@/shared/hooks/use-remembered-selection';
import { Activity } from 'lucide-react';
import PageBody from '@/shared/components/layout/PageBody';
import PageBar from '@/shared/components/layout/PageBar';
import ListPageShell from '@/shared/components/ListPageShell';
import EntitySelect from '@/shared/components/EntitySelect';
import MetricsOverview from '@/modules/metric/components/MetricsOverview';
import { useQuery } from '@/shared/hooks/api/use-query';
import { usePolledQuery } from '@/shared/hooks/api/use-polled-query';
import { metricApi } from '@/modules/metric/api/api';
import { containerLabel } from '@/modules/metric/utils/container-label';
import { metricErrorMessages } from '@/modules/metric/utils/error-messages';
import { errorCopy } from '@/shared/utils/error-copy';
import type { Metric } from '@quantum/contracts/modules/metric/domain';

const copy = errorCopy(metricErrorMessages);

const sortByTs = (samples: Metric[]): Metric[] =>
    [...samples].sort((a, b) => new Date(a.ts).valueOf() - new Date(b.ts).valueOf());

const Metrics = () => {
    const containers = useQuery(metricApi.containers, []);
    const containerIds = useMemo(() => (containers.data ?? []).map((entry) => entry.containerId), [containers.data]);
    const [containerId, setContainerId] = useRememberedSelection<number>('metrics.container', containerIds);

    const metrics = usePolledQuery(
        useQuery(
            (metricContainerId: number, query: { limit?: number }) =>
                metricApi.byContainer({ path: { containerId: metricContainerId }, query }),
            [containerId ?? undefined, { limit: 60 }],
            { enabled: containerId !== null }
        ),
        { while: (data) => data !== null, everyMs: 10000 }
    );

    if(containers.loading || containers.error !== undefined){
        return (
            <ListPageShell
                bare
                loading={containers.loading}
                skeleton={<PageSkeleton actions={1}><BoardSkeleton stats={5} /></PageSkeleton>}
                error={containers.error}
                errorTitle='Could not load applications'
                getErrorDescription={copy}
                onRetry={containers.reload}
            />
        );
    }

    const items = containers.data ?? [];
    const samples = sortByTs(metrics.data ?? []);
    const latest = samples[samples.length - 1];

    return (
        <>
            <PageBar
                title='Metrics'
                icon={Activity}
                actions={(
                    <div className='w-64 max-w-[50vw]'>
                        <EntitySelect
                            items={items}
                            getKey={(container) => container.containerId}
                            getLabel={containerLabel}
                            value={containerId}
                            onChange={(key) => setContainerId(Number(key))}
                            placeholder='Select an application'
                            ariaLabel='Application'
                        />
                    </div>
                )}
            />

            <PageBody variant='flush' fill>
                <ListPageShell
                    loading={metrics.loading}
                    skeleton={<BoardSkeleton stats={5} />}
                    error={metrics.error}
                    errorTitle='Could not load metrics'
                    getErrorDescription={copy}
                    onRetry={metrics.reload}
                    showPrompt={containerId === null}
                    prompt={{
                        icon: Activity,
                        title: 'Select an application',
                        description: 'Choose a repository, a database or a stack service to see its CPU, memory, network and processes.'
                    }}
                    isEmpty={latest === undefined}
                    empty={{
                        icon: Activity,
                        title: 'No samples yet',
                        description: 'This container has not reported any usage yet. Samples appear once it starts.'
                    }}
                >
                    {latest !== undefined && <MetricsOverview samples={samples} latest={latest} />}
                </ListPageShell>
            </PageBody>
        </>
    );
};

export default Metrics;
