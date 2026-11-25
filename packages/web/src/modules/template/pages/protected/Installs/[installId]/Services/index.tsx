import { useOutletContext } from 'react-router-dom';
import { Layers } from 'lucide-react';
import PageBody from '@/shared/components/layout/PageBody';
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

    return (
        <PageBody fill className='gap-5'>
            {showProgress && <DeploymentProgress installId={install.id} active={deploying} />}

            {install.services.length > 0 && <ServicesTable host={host} services={install.services} status={install.status} />}

            {install.services.length === 0 && !deploying && (
                <CenterState>
                    <EmptyState
                        icon={Layers}
                        title='No services yet'
                        description='The services of this stack appear here once it has been provisioned.'
                        compact
                    />
                </CenterState>
            )}
        </PageBody>
    );
};

export default InstallServices;
