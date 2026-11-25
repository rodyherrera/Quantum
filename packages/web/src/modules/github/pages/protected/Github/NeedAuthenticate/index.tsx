import { Link as RouterLink } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';
import { Check } from 'lucide-react';
import PageBar from '@/shared/components/layout/PageBar';
import PageBody from '@/shared/components/layout/PageBody';
import PageIntro from '@/shared/components/layout/PageIntro';
import GithubIcon from '@/shared/components/icons/GithubIcon';
import ConnectGithubButton from '@/modules/github/components/ConnectGithubButton';

interface Permission{
    title: string;
    detail: string;
    scope?: string;
}

const PERMISSIONS: Permission[] = [
    { title: 'Read your repositories', detail: 'Public and private, to clone the branch you deploy', scope: 'repo' },
    { title: 'Register webhooks', detail: 'For push and release events on the repositories you deploy' },
    { title: 'Pull from GitHub Container Registry', detail: 'Private images on ghcr.io', scope: 'read:packages' },
    { title: 'Know who you are', detail: 'Your GitHub username and avatar', scope: 'user' }
];

const ConnectionPair = () => (
    <div aria-hidden='true' className='flex items-center gap-3.5'>
        <img src='/favicon.svg' alt='' className='size-11 rounded-[0.625rem]' />
        <span className='h-px w-10 bg-[repeating-linear-gradient(90deg,var(--subtle)_0_3px,transparent_3px_7px)]' />
        <span className='grid size-11 place-items-center rounded-[0.625rem] border border-border bg-surface-secondary text-foreground'>
            <GithubIcon className='size-5' />
        </span>
    </div>
);

const NeedAuthenticate = () => (
    <>
        <PageBar title='GitHub' />

        <PageBody variant='narrow' className='flex max-w-[32.5rem] flex-col gap-6 pt-16'>
            <ConnectionPair />

            <PageIntro
                title='Connect GitHub'
                description='Quantum lists your repositories, deploys the branch you pick and registers a webhook on each repository you deploy, so every push redeploys it.'
            />

            <ul aria-label='What Quantum can do with your account' className='rounded-lg border border-separator bg-surface'>
                {PERMISSIONS.map((permission) => (
                    <li key={permission.title} className='flex items-start gap-2.5 border-t border-separator px-3.5 py-3 first:border-t-0'>
                        <Check aria-hidden='true' className='mt-0.5 size-4 shrink-0 text-success' />
                        <div className='flex min-w-0 flex-col gap-0.5'>
                            <span className='font-medium text-foreground'>{permission.title}</span>
                            <span className='text-subtle'>
                                {permission.detail}
                                {permission.scope !== undefined && (
                                    <>
                                        {' · scope '}
                                        <span className='font-mono text-xs'>{permission.scope}</span>
                                    </>
                                )}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>

            <div className='flex flex-wrap items-start gap-2'>
                <ConnectGithubButton />
                <RouterLink to='/applications' className={buttonVariants({ variant: 'ghost' })}>Skip for now</RouterLink>
            </div>
        </PageBody>
    </>
);

export default NeedAuthenticate;
