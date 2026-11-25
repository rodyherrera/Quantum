import { useState } from 'react';
import { Button, cn } from '@heroui/react';
import { Check, Copy } from 'lucide-react';
import { copyText } from '@/shared/utils/clipboard';

const COPIED_MS = 2000;

interface CopyButtonProps{
    value: string;
    label?: string;
    className?: string;
}

const CopyButton = ({ value, label = 'Copy to clipboard', className }: CopyButtonProps) => {
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
            className={cn('size-7 min-w-7 shrink-0 text-subtle hover:text-foreground', className)}
            onPress={() => { void copy(); }}
        >
            {copied ? <Check aria-hidden='true' className='text-success' /> : <Copy aria-hidden='true' />}
        </Button>
    );
};

export default CopyButton;
