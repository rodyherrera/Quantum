import { lazy, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import LandingSection from '@/modules/home/components/LandingSection';
import LandingDeferred from '@/modules/home/components/LandingDeferred';
import { useInView } from '@/modules/home/hooks/use-in-view';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';

const DeployRepository = lazy(() => import('@/modules/home/components/DeployRepository'));

const DeployDatabase = lazy(() => import('@/modules/home/components/DeployDatabase'));

const DeployTemplate = lazy(() => import('@/modules/home/components/DeployTemplate'));

const DeployStack = lazy(() => import('@/modules/home/components/DeployStack'));

const TAB_MS = 9_000;

interface Kind{
    id: string;
    label: string;
    title: string;
    body: string;
    facts: string[];
    visual: (isActive: boolean) => ReactNode;
}

const KINDS: Kind[] = [
    {
        id: 'repository',
        label: 'Repository',
        title: 'A GitHub repository.',
        body: 'Pick a repository and a branch. Quantum builds it from its Dockerfile, a prebuilt image or the commands you give it, and redeploys on every push.',
        facts: ['Dockerfile, image or your own commands', 'Redeploys on every push to the branch', 'Roll back to any earlier build'],
        visual: (isActive) => <DeployRepository isActive={isActive} />
    },
    {
        id: 'database',
        label: 'Database',
        title: 'A database.',
        body: 'PostgreSQL, MySQL, MariaDB, MongoDB or Redis on its own volume, with a connection string to copy and backups you restore from the dashboard.',
        facts: ['Five engines, any version tag', 'Backups and one-click restore', 'Private address on your network'],
        visual: (isActive) => <DeployDatabase isActive={isActive} />
    },
    {
        id: 'template',
        label: 'Template',
        title: 'A one-click template.',
        body: 'n8n, Directus, WordPress, Uptime Kuma, Ollama and the rest of the catalogue. The ones that need a database bring their own. Go ahead, browse it.',
        facts: ['21 templates after one command', 'Services and volumes already set', 'Variables per service'],
        visual: () => <DeployTemplate />
    },
    {
        id: 'stack',
        label: 'Compose stack',
        title: 'A Compose stack.',
        body: 'Point Quantum at a repository with a compose file, or paste one. Services build on the server, reach each other by name and redeploy on every push or release.',
        facts: ['image, build, ports, volumes, depends_on', 'GitHub webhook registered for you', 'Unchanged images are reused'],
        visual: (isActive) => <DeployStack isActive={isActive} />
    }
];

const STEP_KEYS: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

const LandingDeploy = () => {
    const stage = useRef<HTMLDivElement>(null);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);
    const isVisible = useInView(stage, { margin: '-25% 0px' });
    const [active, setActive] = useState(0);
    const [isHeld, setHeld] = useState(false);

    const select = (index: number) => {
        const next = (index + KINDS.length) % KINDS.length;
        setActive(next);
        tabs.current[next]?.focus();
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const step = STEP_KEYS[event.key];
        if(step === undefined) return;

        event.preventDefault();
        select(active + step);
    };

    return (
        <LandingSection
            id='deploy'
            index='01'
            label='Deploy'
            title='Four ways in.'
            subtitle='One table to run them.'
        >
            <div
                ref={stage}
                data-paused={!isVisible || isHeld}
                onPointerEnter={() => setHeld(true)}
                onPointerLeave={() => setHeld(false)}
                onFocus={() => setHeld(true)}
                onBlur={() => setHeld(false)}
                className='lp-stage'
            >
                <div role='tablist' aria-label='What you can deploy' onKeyDown={onKeyDown} className='lp-tabs lp-reveal'>
                    {KINDS.map((kind, index) => (
                        <button
                            key={kind.id}
                            ref={(node) => { tabs.current[index] = node; }}
                            id={`deploy-tab-${kind.id}`}
                            type='button'
                            role='tab'
                            aria-selected={index === active}
                            aria-controls={`deploy-panel-${kind.id}`}
                            tabIndex={index === active ? 0 : -1}
                            onClick={() => setActive(index)}
                            className='lp-tab'
                        >
                            <span className='lp-index'>{String(index + 1).padStart(2, '0')}</span>
                            <span className='label-caps'>{kind.label}</span>
                            <span
                                aria-hidden='true'
                                className='lp-tab__progress'
                                style={{ '--lp-tab-ms': `${TAB_MS}ms` } as CSSProperties}
                                onAnimationEnd={() => setActive((index + 1) % KINDS.length)}
                            />
                        </button>
                    ))}
                </div>

                <div className='lp-panels mt-[clamp(32px,3.4vw,56px)]'>
                    {KINDS.map((kind, index) => (
                        <div
                            key={kind.id}
                            id={`deploy-panel-${kind.id}`}
                            role='tabpanel'
                            aria-labelledby={`deploy-tab-${kind.id}`}
                            data-active={index === active}
                            className='lp-panel grid gap-10 lg:grid-cols-12 lg:gap-6'
                        >
                            <div className='flex flex-col lg:col-span-4 lg:pr-10'>
                                <h3 className='lp-title'>{kind.title}</h3>
                                <p className='lp-body mt-4 max-w-[44ch]'>{kind.body}</p>

                                <ul className='mt-8 flex flex-col border-t border-[var(--lp-line)]'>
                                    {kind.facts.map((fact) => (
                                        <li key={fact} className='flex items-center gap-3 border-b border-[var(--lp-line)] py-3.5 text-[0.875rem]'>
                                            <Check aria-hidden='true' className='size-3.5 shrink-0 lp-dim' />
                                            {fact}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <LandingDeferred className='min-w-0 lg:col-span-8'>
                                {kind.visual(index === active && isVisible)}
                            </LandingDeferred>
                        </div>
                    ))}
                </div>
            </div>
        </LandingSection>
    );
};

export default LandingDeploy;
