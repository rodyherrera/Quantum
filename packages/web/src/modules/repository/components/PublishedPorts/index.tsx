import SettingsSection, { SettingsBlock } from '@/shared/components/SettingsSection';
import SettingsRow from '@/shared/components/SettingsRow';
import { PortLink } from '@/modules/repository/components/PortLinks';
import { usePublicHost } from '@/shared/hooks/use-public-host';
import type { RepositoryPort } from '@quantum/contracts/modules/repository/domain';

interface PublishedPortsProps{
    ports: RepositoryPort[];
}

const PublishedPorts = ({ ports }: PublishedPortsProps) => {
    const host = usePublicHost();

    return (
        <SettingsSection title='Published ports' description='Container ports reachable from outside the server. Quantum picks the host port for each one.'>
            {ports.length === 0 ? (
                <SettingsBlock>
                    <p className='text-subtle'>No published ports</p>
                </SettingsBlock>
            ) : ports.map((port) => (
                <SettingsRow
                    key={`${port.internalPort}/${port.externalPort}`}
                    title={<span className='font-mono'>{port.internalPort}</span>}
                    description={`Container port, ${port.protocol.toUpperCase()}`}
                    action={<PortLink host={host} port={port} />}
                />
            ))}
        </SettingsSection>
    );
};

export default PublishedPorts;
