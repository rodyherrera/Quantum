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
        return <span className='text-xs text-subtle'>Internal only</span>;
    }

    return (
        <div className='flex flex-wrap items-center gap-1'>
            {service.ports.map((port) => (
                <a
                    key={`${port.internalPort}/${port.protocol}`}
                    href={portUrl(host, port.externalPort)}
                    target='_blank'
                    rel='noreferrer'
                    title={`Open ${host}:${port.externalPort}`}
                    className='inline-flex h-[1.375rem] items-center gap-1 whitespace-nowrap rounded-[0.3125rem] border border-border px-1.5 font-mono text-[0.71875rem] text-muted transition-colors hover:border-subtle hover:text-foreground motion-reduce:transition-none'
                >
                    <span><span className='sr-only'>{host}</span>:{port.externalPort}</span>
                    <span aria-hidden='true'>→</span>
                    <span className='font-medium text-foreground'>{port.internalPort}</span>
                    <ArrowUpRight aria-hidden='true' className='size-3 text-subtle' />
                </a>
            ))}
        </div>
    );
};

interface ServicesTableProps{
    host: string;
    services: TemplateInstallService[];
}

/* Services carry no state of their own, so every row shows the state of the stack they belong to. */
const ServicesTable = ({ host, services }: ServicesTableProps) => (
    <div className='min-w-0 overflow-hidden rounded-lg border border-separator bg-surface [&_tbody_tr:last-child_td]:border-b-0'>
        <Table>
            <Table.ScrollContainer>
                <Table.Content aria-label='Services' className='min-w-[40rem]'>
                    <Table.Header>
                        <Table.Column isRowHeader>Service</Table.Column>
                        <Table.Column>Image</Table.Column>
                        <Table.Column>Address</Table.Column>
                        <Table.Column>Published</Table.Column>
                    </Table.Header>

                    <Table.Body>
                        {services.map((service) => (
                            <Table.Row key={service.name}>
                                <Table.Cell>
                                    <span className='block truncate font-medium text-foreground'>{service.name}</span>
                                </Table.Cell>
                                <Table.Cell>
                                    <code className='block max-w-[20rem] truncate font-mono text-xs text-subtle' title={service.image}>{service.image}</code>
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
    </div>
);

export default ServicesTable;
