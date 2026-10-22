import { lazy } from 'react';
import EnvironmentVariablesEditor from '@/shared/components/EnvironmentVariablesEditor';
import InternalAddress from '@/shared/components/InternalAddress';
import VsCodeIcon from '@/shared/components/icons/VsCodeIcon';
import EventsTable from '@/modules/activity/components/EventsTable';
import LandingSection from '@/modules/home/components/LandingSection';
import LandingDeferred from '@/modules/home/components/LandingDeferred';
import { DEMO_EVENTS } from '@/modules/home/utils/demo/activity';
import { address } from '@/modules/home/utils/demo/entities';
import { order } from '@/modules/home/utils/order';
import type { ReactNode } from 'react';

const OperateTerminal = lazy(() => import('@/modules/home/components/OperateTerminal'));

const OperateMetrics = lazy(() => import('@/modules/home/components/OperateMetrics'));

const VARIABLES = {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://qdb_7f3a91c2@172.30.0.2:5432/postgres_9b41d7e0',
    REDIS_URL: 'redis://172.30.0.3:6379',
    SESSION_SECRET: '3f0c9a1e8b7d6c5f4e3d2c1b0a9f8e7d'
};

const ADDRESSES = [
    { name: 'storefront', kind: 'Repository', address: address('172.30.0.7', 'repository-12') },
    { name: 'orders', kind: 'PostgreSQL', address: address('172.30.0.2', 'database-3') },
    { name: 'shop · api', kind: 'Stack service', address: address('172.30.0.12', 'stack-api') },
    { name: 'n8n', kind: 'Template', address: address('172.30.0.5', 'stack-app') }
];

const saveNothing = (): Promise<void> => Promise.resolve();

const noMessage = (): string => '';

interface CellProps{
    title: string;
    body: string;
    className?: string;
    children?: ReactNode;
}

const Cell = ({ title, body, className = '', children }: CellProps) => (
    <article className={`lp-cell ${className}`}>
        <header>
            <h3 className='lp-title'>{title}</h3>
            <p className='lp-body mt-3 max-w-[46ch]'>{body}</p>
        </header>

        {children}
    </article>
);

const LandingOperate = () => (
    <LandingSection
        id='operate'
        index='02'
        label='Operate'
        title='Everything a running app needs.'
        subtitle='For every container.'
    >
        <div className='lp-grid lp-reveal grid-cols-1 lg:grid-cols-12'>
            <Cell
                className='lg:col-span-7'
                title='Logs and a shell.'
                body='Follow the output of one service at a time, or open a shell inside its container, right in the browser.'
            >
                <LandingDeferred className='flex min-h-[26rem] flex-1 flex-col'>
                    <OperateTerminal />
                </LandingDeferred>
            </Cell>

            <Cell
                className='lg:col-span-5'
                title='Variables that save as you type.'
                body='Per service, applied on the next redeploy. A .env in the repository is imported on the first clone. Go ahead, edit one.'
            >
                <EnvironmentVariablesEditor
                    variables={VARIABLES}
                    save={saveNothing}
                    getErrorMessage={noMessage}
                    title='storefront'
                    description='Applied on the next redeploy.'
                    emptyDescription='Add the first variable this application needs.'
                    fills={false}
                />
            </Cell>

            <Cell
                className='lg:col-span-12'
                title='CPU, memory, network, processes.'
                body='Live for every container, with the recent samples charted. Usage adds it up per project.'
            >
                <LandingDeferred className='min-h-[26rem]'>
                    <OperateMetrics />
                </LandingDeferred>
            </Cell>

            <Cell
                className='lg:col-span-7'
                title='A record of every step.'
                body='Each deployment step, start and stop, with where it came from and when.'
            >
                <EventsTable events={DEMO_EVENTS} />
            </Cell>

            <Cell
                className='lg:col-span-5'
                title='A private network.'
                body="Every container joins your organization's network, so apps reach databases and services by address without publishing a port."
            >
                <ul className='flex flex-col border-t border-border'>
                    {ADDRESSES.map((entry) => (
                        <li key={entry.name} className='flex items-center justify-between gap-4 border-b border-separator py-3'>
                            <span className='flex min-w-0 flex-col'>
                                <span className='truncate text-sm font-medium text-foreground'>{entry.name}</span>
                                <span className='text-[0.8125rem] text-muted'>{entry.kind}</span>
                            </span>

                            <InternalAddress address={entry.address} />
                        </li>
                    ))}
                </ul>
            </Cell>

            <Cell
                className='lg:col-span-4'
                title='VS Code in the browser.'
                body='A code-server workspace with the same files and network as the app, behind a password. Stop it and the space is freed.'
            >
                <VsCodeIcon className='mt-auto size-8 lp-dim' />
            </Cell>

            <Cell
                className='lg:col-span-4'
                title='Persistent volumes.'
                body='List a path and it survives every redeploy. Databases and templates keep their data on volumes by default.'
            />

            <Cell
                className='lg:col-span-4'
                title='Teams and private registries.'
                body='Organizations with owners, admins, members and viewers. Pull from any private registry with a token.'
            />
        </div>

        <p className='lp-index lp-reveal mt-6' style={order(1)}>Real components from the Quantum dashboard, running with sample data.</p>
    </LandingSection>
);

export default LandingOperate;
