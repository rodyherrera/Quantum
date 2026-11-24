import { Link as RouterLink } from 'react-router-dom';
import PageBody from '@/shared/components/layout/PageBody';
import ConnectGithubButton from '@/modules/github/components/ConnectGithubButton';

const NeedAuthenticate = () => (
    <PageBody fill>
        <div className='dot-grid flex flex-1 flex-col justify-center'>
            <p className='label-caps text-muted'>GitHub</p>

            <h1 className='title-display mt-5 max-w-[14ch] text-[2.75rem] leading-[1.02] text-foreground sm:text-[3.25rem]'>
                Connect GitHub
            </h1>

            <p className='mt-5 max-w-md text-sm text-muted'>
                Connect your GitHub account to import and deploy repositories.
            </p>

            <div className='mt-9 flex items-center gap-6'>
                <ConnectGithubButton />

                <RouterLink to='/applications' className='label-caps text-muted transition-colors hover:text-foreground'>
                    Skip for now
                </RouterLink>
            </div>
        </div>
    </PageBody>
);

export default NeedAuthenticate;
