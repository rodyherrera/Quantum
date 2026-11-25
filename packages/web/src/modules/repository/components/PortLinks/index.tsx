import { ExternalLink } from 'lucide-react';
import { portUrl, usePublicHost } from '@/shared/hooks/use-public-host';
import type { RepositoryPort } from '@quantum/contracts/modules/repository/domain';

interface PortLinkProps{
    host: string;
    port: RepositoryPort;
}

export const PortLink = ({ host, port }: PortLinkProps) => {
    const url = portUrl(host, port.externalPort);

    return (
        <a
            href={url}
            target='_blank'
            rel='noreferrer'
            title={`${url} → ${port.internalPort}`}
            aria-label={`Open ${url}, container port ${port.internalPort}`}
            className='inline-flex h-[1.375rem] shrink-0 items-center gap-1 whitespace-nowrap rounded-[0.3125rem] border border-border px-1.5 font-mono text-xs text-muted transition-colors hover:border-subtle hover:text-foreground motion-reduce:transition-none'
        >
            :{port.externalPort}
            <span aria-hidden='true' className='text-subtle'>→</span>
            <span className='font-medium text-foreground'>{port.internalPort}</span>
            <ExternalLink aria-hidden='true' className='size-3 text-subtle' />
        </a>
    );
};

interface PortLinksProps{
    ports: RepositoryPort[];
}

const PortLinks = ({ ports }: PortLinksProps) => {
    const host = usePublicHost();

    return (
        <>
            {ports.map((port) => <PortLink key={`${port.internalPort}/${port.externalPort}`} host={host} port={port} />)}
        </>
    );
};

export default PortLinks;
