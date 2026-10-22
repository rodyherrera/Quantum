import { useOutletContext } from 'react-router-dom';
import { Layers } from 'lucide-react';
import EmptyState from '@/shared/components/EmptyState';
import CenterState from '@/shared/components/CenterState';
import DeploymentProgress from '@/modules/template/components/DeploymentProgress';
import ServicesTable from '@/modules/template/components/ServicesTable';
import { isInstallTransient } from '@/modules/template/utils/install-status';
import { usePublicHost } from '@/shared/hooks/use-public-host';
import { TemplateInstallStatus } from '@quantum/contracts/modules/template/domain';
import type { TemplateInstall } from '@quantum/contracts/modules/template/domain';

const InstallServices = () => {
    const install = useOutletContext<TemplateInstall>();
    const host = usePublicHost();

    const deploying = isInstallTransient(install.status);
    const showProgress = deploying || install.status === TemplateInstallStatus.Error;

    if(install.services.length === 0){
        return (
            <div className='flex flex-col gap-10'>
                {showProgress && <DeploymentProgress installId={install.id} active={deploying} />}
                {!deploying && (
                    <CenterState className='h-full'>
                        <EmptyState
                            icon={Layers}
                            title='No services yet'
                            description='The services of this stack appear here once it has been provisioned.'
                            compact
                        />
                    </CenterState>
                )}
            </div>
        );
    }

    return (
        <div className='flex flex-col gap-10'>
            {showProgress && <DeploymentProgress installId={install.id} active={deploying} />}
            <ServicesTable host={host} services={install.services} />
        </div>
    );
};

export default InstallServices;
