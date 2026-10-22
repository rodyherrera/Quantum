import { Table } from '@heroui/react';
import { ArrowUpRight } from 'lucide-react';
import InternalAddress from '@/shared/components/InternalAddress';
import { portUrl } from '@/shared/hooks/use-public-host';
import type { TemplateInstallService } from '@quantum/contracts/modules/template/domain';

interface PublishedPortsProps{
    host: string;
    service: TemplateInstallService;
}

const PublishedPorts = ({ host, service }: PublishedPortsProps) => {
    if(service.ports.length === 0){
        return <span className='text-[0.8125rem] text-muted'>Internal only</span>;
    }

    return (
        <div className='flex flex-wrap items-center gap-x-4 gap-y-1'>
            {service.ports.map((port) => (
                <a
                    key={`${port.internalPort}/${port.protocol}`}
                    href={portUrl(host, port.externalPort)}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-flex items-center gap-1 font-mono text-[0.8125rem] text-muted transition-colors hover:text-foreground motion-reduce:transition-none'
                >
                    {host}:{port.externalPort}
                    <span className='text-muted/70'>&rarr; {port.internalPort}</span>
                    <ArrowUpRight aria-hidden='true' className='size-3.5' />
                </a>
            ))}
        </div>
    );
};

interface ServicesTableProps{
    host: string;
    services: TemplateInstallService[];
}

const ServicesTable = ({ host, services }: ServicesTableProps) => (
    <Table>
        <Table.ScrollContainer>
            <Table.Content aria-label='Services'>
                <Table.Header>
                    <Table.Column isRowHeader>Service</Table.Column>
                    <Table.Column>Image</Table.Column>
                    <Table.Column>Address</Table.Column>
                    <Table.Column>Published ports</Table.Column>
                </Table.Header>

                <Table.Body>
                    {services.map((service) => (
                        <Table.Row key={service.name}>
                            <Table.Cell>
                                <span className='font-medium text-foreground'>{service.name}</span>
                            </Table.Cell>
                            <Table.Cell>
                                <code className='font-mono text-[0.8125rem] text-muted'>{service.image}</code>
                            </Table.Cell>
                            <Table.Cell>
                                <InternalAddress address={service.address} />
                            </Table.Cell>
                            <Table.Cell>
                                <PublishedPorts host={host} service={service} />
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Content>
        </Table.ScrollContainer>
    </Table>
);

export default ServicesTable;
