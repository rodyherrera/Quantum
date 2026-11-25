import { Building2 } from 'lucide-react';
import { PageSkeleton } from '@/shared/components/skeletons';
import ErrorState from '@/shared/components/ErrorState';
import CenterState from '@/shared/components/CenterState';
import CreateOrganizationForm from '@/modules/organization/components/CreateOrganizationForm';
import { useTenancy } from '@/modules/organization/hooks/use-tenancy';
import { tenancyErrorMessages } from '@/modules/organization/utils/error-messages';
import { errorCopy } from '@/shared/utils/error-copy';
import type { ReactNode } from 'react';

const copy = errorCopy(tenancyErrorMessages);

const FirstOrganization = ({ onCreated }: { onCreated: () => void }) => (
    <section className='flex w-full max-w-sm flex-col gap-5'>
        <header className='flex flex-col items-center gap-4 text-center'>
            <span aria-hidden='true' className='grid size-10 place-items-center rounded-xl border border-border bg-surface-secondary text-muted'>
                <Building2 className='size-[1.125rem]' />
            </span>

            <div className='flex flex-col gap-1.5'>
                <h2 className='text-xl font-semibold tracking-[-0.015em] text-foreground'>Create an organization</h2>
                <p className='text-muted'>Organizations hold your applications, projects and teammates. Create one to get started.</p>
            </div>
        </header>

        <div className='rounded-lg border border-separator bg-surface p-4'>
            <CreateOrganizationForm onCreated={onCreated} />
        </div>
    </section>
);

interface OrgGateProps{
    children: ReactNode;
}

const OrgGate = ({ children }: OrgGateProps) => {
    const { organizations, loading, error, reload } = useTenancy();

    if(loading) return <PageSkeleton />;

    if(error !== undefined){
        return (
            <CenterState className='h-full p-6'>
                <ErrorState
                    title='Could not load organizations'
                    description={copy(error)}
                    onRetry={reload}
                />
            </CenterState>
        );
    }

    if(organizations.length === 0){
        return (
            <CenterState className='h-full p-6'>
                <FirstOrganization onCreated={reload} />
            </CenterState>
        );
    }

    return <>{children}</>;
};

export default OrgGate;
