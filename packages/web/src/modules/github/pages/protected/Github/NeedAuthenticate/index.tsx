import { Link as RouterLink } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';
import PageBar from '@/shared/components/layout/PageBar';
import PageBody from '@/shared/components/layout/PageBody';
import PageIntro from '@/shared/components/layout/PageIntro';
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

const NeedAuthenticate = () => (
    <>
        <PageBar title='GitHub' />

        <PageBody variant='narrow' className='flex max-w-[32.5rem] flex-col gap-6 pt-16'>
            <PageIntro
                title='Connect GitHub'
                description='Quantum lists your repositories, deploys the branch you pick and registers a webhook on each repository you deploy, so every push redeploys it.'
            />

            <ul aria-label='What Quantum can do with your account' className='rounded-lg border border-separator bg-surface'>
                {PERMISSIONS.map((permission) => (
                    <li key={permission.title} className='flex items-start gap-2.5 border-t border-separator px-3.5 py-3 first:border-t-0'>
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
