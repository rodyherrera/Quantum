import InternalAddress from '@/shared/components/InternalAddress';
import { address } from '@/landing/utils/demo/entities';

const ADDRESSES = [
    { name: 'orders', kind: 'PostgreSQL', address: address('172.30.0.2', 'database-3') },
    { name: 'shop · api', kind: 'Stack service', address: address('172.30.0.12', 'stack-api') }
];

const OperateAddresses = () => (
    <ul className='w-full overflow-hidden border border-separator'>
        {ADDRESSES.map((entry) => (
            <li key={entry.name} className='flex items-center justify-between gap-3 border-t border-separator py-1 pl-2.5 pr-1 first:border-t-0'>
                <span className='min-w-0 truncate'>
                    <span className='font-medium text-foreground'>{entry.name}</span>
                    <span className='ml-2 text-xs text-subtle'>{entry.kind}</span>
                </span>

                <InternalAddress address={entry.address} />
            </li>
        ))}
    </ul>
);

export default OperateAddresses;
