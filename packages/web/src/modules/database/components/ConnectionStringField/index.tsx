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
            <span className='label-caps text-muted'>Connection string</span>

            <div className='flex items-center gap-2'>
                <code className='min-w-0 flex-1 truncate border border-border px-3 py-2 font-mono text-[0.8125rem] text-foreground'>
                    {revealed ? value : '•'.repeat(24)}
                </code>

                <Button variant='secondary' onPress={() => setRevealed((current) => !current)}>
                    {revealed ? <EyeOff aria-hidden='true' className='size-4' /> : <Eye aria-hidden='true' className='size-4' />}
                </Button>

                <Button variant='secondary' onPress={handleCopy}>
                    {copied ? <Check aria-hidden='true' className='size-4' /> : <Copy aria-hidden='true' className='size-4' />}
                </Button>
            </div>
        </div>
    );
};

export default ConnectionStringField;
