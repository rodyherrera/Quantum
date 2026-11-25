import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';
import { ArrowRight, ArrowUpRight, BookOpen, Globe, Server, SquareTerminal } from 'lucide-react';
import GithubIcon from '@/shared/components/icons/GithubIcon';
import LandingShell from '@/modules/home/components/LandingShell';
import FeatureGrid from '@/modules/home/components/FeatureGrid';
import FeatureCell from '@/modules/home/components/FeatureCell';
import CommandBlock from '@/modules/home/components/CommandBlock';
import GuideSection from '@/modules/home/components/GuideSection';
import GuideSetupPicker from '@/modules/home/components/GuideSetupPicker';
import GuideStepItem from '@/modules/home/components/GuideStepItem';
import GuideRail from '@/modules/home/components/GuideRail';
import GuideText from '@/modules/home/components/GuideText';
import GuideTroubles from '@/modules/home/components/GuideTroubles';
import { useCurrentStep } from '@/modules/home/hooks/use-current-step';
import { useGuideStore } from '@/modules/home/store/guide';
import { USEFUL_COMMANDS, guideFor, targetFor, troublesFor } from '@/modules/home/utils/guide';
import { GITHUB_URL, ISSUES_URL } from '@/modules/home/utils/links';
import { LEDE, MONO_LABEL, MONO_TITLE, WRAP } from '@/modules/home/utils/classes';

const NEEDS = [
    {
        icon: Server,
        title: 'A Linux server',
        body: 'From any provider. On Ubuntu or Debian every command works as written.'
    },
    {
        icon: SquareTerminal,
        title: 'A terminal',
        body: 'To paste the commands into. Mac, Windows and Linux all come with one, and with SSH to reach a server.'
    },
    {
        icon: Globe,
        title: 'A domain',
        body: "Optional, for HTTPS at your own address. Without one, you open Quantum at the server's IP."
    },
    {
        icon: GithubIcon,
        title: 'A GitHub account',
        body: 'Optional, to deploy your own repositories. Templates, databases and compose files work without it.'
    }
];

const GetStarted = () => {
    const { setup, ip, domain, done, choose, setIp, setDomain, toggle } = useGuideStore();
    const list = useRef<HTMLOListElement>(null);
    const current = useCurrentStep(list, setup);

    const target = targetFor(ip, domain);
    const steps = guideFor(setup, target);
    const keyOf = (id: string) => `${setup}.${id}`;
    const isDone = (id: string) => done.includes(keyOf(id));
    const finished = steps.filter((step) => isDone(step.id)).length;

    return (
        <LandingShell>
            <div className={WRAP}>
                <header id='setup' className='grid scroll-mt-20 grid-cols-1 gap-4 pt-[clamp(2.5rem,7vw,4rem)]'>
                    <p className={`${MONO_LABEL} inline-flex items-center gap-2 text-subtle`}>
                        <BookOpen aria-hidden='true' className='size-3.5' />
                        Self-host guide · {steps.length} steps
                    </p>

                    <h1 className={`${MONO_TITLE} text-[length:clamp(1.75rem,4.6vw,3.125rem)] leading-[1.06] tracking-[-0.01em]`}>
                        <span className='block'>Install Quantum,</span>{' '}
                        <span className='block'>step by step.</span>
                    </h1>

                    <p className={`${LEDE} text-muted`}>Copy each command in order. Pick where it will run and the commands change to match.</p>

                    <GuideSetupPicker
                        setup={setup}
                        ip={ip}
                        domain={domain}
                        onSetupChange={choose}
                        onIpChange={setIp}
                        onDomainChange={setDomain}
                    />
                </header>

                <div className='grid grid-cols-1 gap-8 pb-[clamp(4rem,9vw,6rem)] pt-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14'>
                    <aside className='min-w-0 lg:sticky lg:top-21 lg:self-start'>
                        <GuideRail steps={steps} finished={finished} current={current} isDone={isDone} />
                    </aside>

                    <div className='grid min-w-0 grid-cols-1 gap-14'>
                        <GuideSection id='requirements' title='What you need'>
                            <FeatureGrid columns={2}>
                                {NEEDS.map((need) => <FeatureCell key={need.title} icon={need.icon} title={need.title} body={need.body} />)}
                            </FeatureGrid>
                        </GuideSection>

                        <ol id='steps' ref={list} aria-label='Install steps' className='grid scroll-mt-24 grid-cols-1 gap-12'>
                            {steps.map((step, index) => (
                                <GuideStepItem
                                    key={`${setup}-${step.id}`}
                                    step={step}
                                    number={index + 1}
                                    isDone={isDone(step.id)}
                                    onToggle={() => toggle(keyOf(step.id))}
                                />
                            ))}
                        </ol>

                        <div className='grid gap-4 border border-separator bg-surface bg-[radial-gradient(80%_120%_at_100%_0%,var(--glow),transparent_60%)] p-6'>
                            <p className='text-xl font-semibold tracking-[-0.02em]'>
                                That's it.
                                <span className='text-muted'> The platform is yours.</span>
                            </p>

                            <div className='flex flex-wrap gap-2'>
                                <Link to={{ pathname: '/', hash: 'deploy' }} className={buttonVariants()}>
                                    See what you can deploy
                                    <ArrowRight aria-hidden='true' />
                                </Link>

                                <a href={GITHUB_URL} target='_blank' rel='noreferrer' className={buttonVariants({ variant: 'secondary' })}>
                                    <GithubIcon className='size-3.5' />
                                    Star on GitHub
                                </a>
                            </div>
                        </div>

                        <GuideSection
                            id='troubleshooting'
                            title='If something goes wrong'
                            lead='The script stops with a message that says what is missing. Find yours below.'
                        >
                            <GuideTroubles troubles={troublesFor(setup, target)} />

                            <a href={ISSUES_URL} target='_blank' rel='noreferrer' className='inline-flex w-fit items-center gap-1.5 text-muted transition-colors hover:text-foreground motion-reduce:transition-none'>
                                Still stuck? Open an issue
                                <ArrowUpRight aria-hidden='true' className='size-3.5' />
                            </a>
                        </GuideSection>

                        <GuideSection
                            id='commands'
                            title='Commands worth keeping'
                            lead={<GuideText text='Coming back in a new terminal? Run `cd Quantum` first, then any of these.' />}
                        >
                            <div className='grid gap-3 md:grid-cols-2'>
                                {USEFUL_COMMANDS.map((command) => (
                                    <CommandBlock key={command.code} label={command.label} command={command.code} />
                                ))}
                            </div>
                        </GuideSection>
                    </div>
                </div>
            </div>
        </LandingShell>
    );
};

export default GetStarted;
