import { useState } from 'react';
import { Button } from '@heroui/react';
import { Check, Copy } from 'lucide-react';
import { copyText } from '@/shared/utils/clipboard';
import type { ContainerAddress } from '@quantum/contracts/modules/docker/domain';

const COPIED_MS = 2000;

interface InternalAddressProps{
    address: ContainerAddress | null;
}

const InternalAddress = ({ address }: InternalAddressProps) => {
    const [copied, setCopied] = useState(false);

    const ip = address?.ip ?? null;
    if(address === null || ip === null){
        return <span className='text-subtle'>—</span>;
    }

    const copy = async () => {
        await copyText(ip);
        setCopied(true);
        setTimeout(() => setCopied(false), COPIED_MS);
    };

    return (
        <div className='flex min-w-0 flex-col'>
            <span className='flex items-center gap-1'>
                <code className='truncate font-mono text-xs text-muted'>{ip}</code>
                <Button
                    isIconOnly
                    variant='ghost'
                    size='sm'
                    className='size-5 min-w-5 text-subtle hover:text-foreground'
                    aria-label={`Copy ${ip}`}
                    onPress={() => { void copy(); }}
                >
                    {copied
                        ? <Check aria-hidden='true' className='size-3.5' />
                        : <Copy aria-hidden='true' className='size-3.5' />}
                </Button>
            </span>
        </div>
    );
};

export default InternalAddress;
