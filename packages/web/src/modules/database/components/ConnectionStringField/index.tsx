import { useState } from 'react';
import { Button } from '@heroui/react';
import { Check, Copy, Eye, EyeOff } from 'lucide-react';
import { copyText } from '@/shared/utils/clipboard';

interface ConnectionStringFieldProps{
    value: string;
}

const ConnectionStringField = ({ value }: ConnectionStringFieldProps) => {
    const [revealed, setRevealed] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        copyText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className='flex flex-col gap-1.5'>
            <span className='text-xs font-medium text-muted'>Connection string</span>

            <div className='flex items-center gap-1.5'>
                <code className='block h-8 min-w-0 flex-1 truncate rounded-md border border-border bg-surface-secondary px-2.5 font-mono text-xs leading-[1.875rem] text-foreground'>
                    {revealed ? value : '•'.repeat(24)}
                </code>

                <Button
                    isIconOnly
                    variant='secondary'
                    aria-label={revealed ? 'Hide connection string' : 'Show connection string'}
                    onPress={() => setRevealed((current) => !current)}
                >
                    {revealed ? <EyeOff aria-hidden='true' /> : <Eye aria-hidden='true' />}
                </Button>

                <Button isIconOnly variant='secondary' aria-label={copied ? 'Copied' : 'Copy connection string'} onPress={handleCopy}>
                    {copied ? <Check aria-hidden='true' /> : <Copy aria-hidden='true' />}
                </Button>
            </div>
        </div>
    );
};

export default ConnectionStringField;
