import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import GithubIcon from '@/shared/components/icons/GithubIcon';
import LandingShell from '@/modules/home/components/LandingShell';
import LandingSection from '@/modules/home/components/LandingSection';
import LandingWords from '@/modules/home/components/LandingWords';
import CommandBlock from '@/modules/home/components/CommandBlock';
import GuideSetupPicker from '@/modules/home/components/GuideSetupPicker';
import GuideStepItem from '@/modules/home/components/GuideStepItem';
import GuideRail from '@/modules/home/components/GuideRail';
import GuideTroubles from '@/modules/home/components/GuideTroubles';
import { useCurrentStep } from '@/modules/home/hooks/use-current-step';
import { useGuideStore } from '@/modules/home/store/guide';
import { USEFUL_COMMANDS, guideFor, targetFor, troublesFor } from '@/modules/home/utils/guide';
import { GITHUB_URL, ISSUES_URL } from '@/modules/home/utils/links';
import { order } from '@/modules/home/utils/order';

const NEEDS = [
    {
        title: 'A Linux server',
        body: 'From any provider. On Ubuntu or Debian every command works as written.'
    },
    {
        title: 'A terminal',
        body: 'To paste the commands into. Mac, Windows and Linux all come with one, and with SSH to reach a server.'
    },
    {
        title: 'A domain',
        body: "Optional, for HTTPS at your own address. Without one, you open Quantum at the server's IP."
    },
    {
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
            <div className='lp-guide'>
                <section aria-labelledby='guide-title' className='lp-wrap pb-[clamp(96px,10vw,176px)] pt-[clamp(64px,9vw,152px)]'>
                    <p className='label-caps lp-dim lp-enter' style={order(0)}>Self-host guide</p>

                    <h1 id='guide-title' className='lp-display mt-8'>
                        <span className='block'><LandingWords text='Install Quantum,' from={0} /></span>
                        <span className='block lp-dim'><LandingWords text='step by step.' from={2} /></span>
                    </h1>

                    <ul id='requirements' aria-label='What you need' className='lp-grid lp-enter scroll-mt-24 mt-[clamp(56px,6vw,96px)] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' style={order(1)}>
                        {NEEDS.map((need) => (
                            <li key={need.title} className='lp-cell'>
                                <p className='flex flex-col gap-3'>
                                    <span className='text-[1.0625rem] tracking-[-0.01em] text-white'>{need.title}</span>
                                    <span className='lp-body'>{need.body}</span>
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>

                <LandingSection
                    id='setup'
                    index='01'
                    label='Choose'
                    title='Where will it run?'
                    subtitle='Pick one to begin.'
                >
                    <div className='lp-reveal'>
                        <GuideSetupPicker
                            setup={setup}
                            ip={ip}
                            domain={domain}
                            onSetupChange={choose}
                            onIpChange={setIp}
                            onDomainChange={setDomain}
                        />
                    </div>
                </LandingSection>

                <LandingSection
                    id='steps'
                    index='02'
                    label='Install'
                    title='Copy, paste, Enter.'
                    subtitle={`${steps.length} steps, in order.`}
                >
                    <div className='grid gap-10 lg:grid-cols-12 lg:gap-6'>
                        <aside className='hidden lg:col-span-3 lg:block'>
                            <div className='sticky top-24 pr-10'>
                                <GuideRail steps={steps} finished={finished} current={current} isDone={isDone} />
                            </div>
                        </aside>

                        <div className='min-w-0 lg:col-span-9'>
                            <p className='lp-index mb-6 lg:hidden'>{finished} of {steps.length} steps done</p>

                            <ol ref={list} className='lp-rule'>
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

                            <div className='flex flex-col items-start gap-8 pt-[clamp(56px,6vw,96px)]'>
                                <p className='text-[clamp(2.25rem,4.4vw,4.5rem)] font-light leading-[0.98] tracking-[-0.045em]'>
                                    That's it.
                                    <span className='block lp-dim'>The platform is yours.</span>
                                </p>

                                <div className='flex flex-wrap gap-3'>
                                    <Link to={{ pathname: '/', hash: 'deploy' }} className={buttonVariants({ size: 'lg' })}>
                                        See what you can deploy
                                        <ArrowRight aria-hidden='true' className='size-4' />
                                    </Link>

                                    <a href={GITHUB_URL} target='_blank' rel='noreferrer' className={buttonVariants({ size: 'lg', variant: 'secondary' })}>
                                        <GithubIcon className='size-4' />
                                        Star on GitHub
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </LandingSection>

                <LandingSection
                    id='troubleshooting'
                    index='03'
                    label='Help'
                    title='If something goes wrong.'
                    subtitle='Most fixes are one command.'
                    lead='The script stops with a message that says what is missing. Find yours below.'
                >
                    <div className='grid gap-10 lg:grid-cols-12 lg:gap-6'>
                        <div className='lp-reveal min-w-0 lg:col-span-9 lg:col-start-4'>
                            <GuideTroubles troubles={troublesFor(setup, target)} />

                            <a href={ISSUES_URL} target='_blank' rel='noreferrer' className='label-caps lp-link mt-10 inline-flex items-center gap-2'>
                                Still stuck? Open an issue
                                <ArrowUpRight aria-hidden='true' className='size-3.5' />
                            </a>
                        </div>
                    </div>
                </LandingSection>

                <LandingSection
                    id='commands'
                    index='04'
                    label='Everyday'
                    title='Commands worth keeping.'
                    subtitle='Run them in the Quantum folder.'
                    lead='Coming back in a new terminal? Run cd Quantum first, then any of these.'
                >
                    <div className='grid gap-10 lg:grid-cols-12 lg:gap-6'>
                        <div className='lp-reveal grid min-w-0 gap-6 md:grid-cols-2 lg:col-span-9 lg:col-start-4'>
                            {USEFUL_COMMANDS.map((command) => (
                                <CommandBlock key={command.code} label={command.label} command={command.code} />
                            ))}
                        </div>
                    </div>
                </LandingSection>
            </div>
        </LandingShell>
    );
};

export default GetStarted;
