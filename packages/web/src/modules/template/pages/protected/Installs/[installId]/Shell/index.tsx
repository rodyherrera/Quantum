import { useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { Layers } from 'lucide-react';
import PageBody from '@/shared/components/layout/PageBody';
import EmptyState from '@/shared/components/EmptyState';
import CenterState from '@/shared/components/CenterState';
import ShellTerminal from '@/shared/components/terminal/ShellTerminal';
import ServicePicker from '@/modules/template/components/ServicePicker';
import type { TemplateInstall } from '@quantum/contracts/modules/template/domain';

const InstallShell = () => {
    const { installId } = useParams<{ installId: string }>();
    const install = useOutletContext<TemplateInstall>();
    const [params, setParams] = useSearchParams();
    const service = params.get('service') ?? install.services.find((entry) => entry.kind === 'app')?.name ?? install.services[0]?.name;

    if(!installId) return null;

    if(service === undefined){
        return (
            <CenterState className='flex-1 py-10'>
                <EmptyState
                    icon={Layers}
                    title='No services yet'
                    description='This stack is still being provisioned. Follow the progress under Services.'
                    compact
                />
            </CenterState>
        );
    }

    return (
        <PageBody fill className='min-h-[32rem] xl:min-h-0'>
            <ShellTerminal
                key={service}
                channelPath={`/template/install/${installId}/terminal`}
                joinPayload={{ service }}
                actions={<ServicePicker services={install.services} value={service} onChange={(name) => setParams({ service: name })} />}
                description={`Interactive session inside the ${service} container.`}
            />
        </PageBody>
    );
};

export default InstallShell;
