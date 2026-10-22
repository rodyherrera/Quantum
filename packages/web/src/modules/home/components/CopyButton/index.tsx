import { useState } from 'react';
import { Button } from '@heroui/react';
import { Check, Copy } from 'lucide-react';
import { copyText } from '@/shared/utils/clipboard';

const COPIED_MS = 2000;

interface CopyButtonProps{
    value: string;
    label?: string;
}

const CopyButton = ({ value, label = 'Copy to clipboard' }: CopyButtonProps) => {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        await copyText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), COPIED_MS);
    };

    return (
        <Button
            isIconOnly
            variant='ghost'
            size='sm'
            aria-label={copied ? 'Copied' : label}
            className='m-1.5 size-8 shrink-0 text-muted hover:text-foreground'
            onPress={() => { void copy(); }}
        >
            {copied ? <Check aria-hidden='true' className='size-4' /> : <Copy aria-hidden='true' className='size-4' />}
        </Button>
    );
};

export default CopyButton;
