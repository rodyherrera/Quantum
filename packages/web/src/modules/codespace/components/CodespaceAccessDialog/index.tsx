import { useState } from 'react';
import { LinesSkeleton } from '@/shared/components/skeletons';
import { Button, buttonVariants, cn } from '@heroui/react';
import { ArrowUpRight, Check, Copy, Square } from 'lucide-react';
import Modal from '@/shared/components/Modal';
import InlineError from '@/shared/components/InlineError';
import { useQuery } from '@/shared/hooks/api/use-query';
import { codespaceApi } from '@/modules/codespace/api/api';
import { codespaceErrorMessages } from '@/modules/codespace/utils/error-messages';
import { copyText } from '@/shared/utils/clipboard';
import { errorCopy } from '@/shared/utils/error-copy';
import type { Codespace } from '@quantum/contracts/modules/codespace/domain';

const copy = errorCopy(codespaceErrorMessages);

interface CopyFieldProps{
    label: string;
    value: string;
}

const CopyField = ({ label, value }: CopyFieldProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        copyText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className='flex flex-col gap-1.5'>
            <span className='text-xs font-medium text-muted'>{label}</span>

            <div className='flex items-center gap-2'>
                <code className='block h-8 min-w-0 flex-1 truncate rounded-md border border-border bg-surface-secondary px-2.5 font-mono text-xs leading-[1.875rem] text-foreground'>
                    {value}
                </code>

                <Button variant='secondary' onPress={handleCopy}>
                    {copied ? <Check aria-hidden='true' /> : <Copy aria-hidden='true' />}
                    {copied ? 'Copied' : 'Copy'}
                </Button>
            </div>
        </div>
    );
};

interface CodespaceAccessDialogProps{
    codespace: Codespace | null;
    onClose: () => void;
    onStop?: () => void;
    isStopping?: boolean;
}

const CodespaceAccessDialog = ({ codespace, onClose, onStop, isStopping = false }: CodespaceAccessDialogProps) => {
    const access = useQuery((codespaceId: number) => codespaceApi.access({ path: { id: codespaceId } }), [codespace?.id], { enabled: codespace !== null });

    return (
        <Modal
            isOpen={codespace !== null}
            onOpenChange={(isOpen) => { if(!isOpen) onClose(); }}
            title={codespace === null ? 'Access' : `Access · ${codespace.name}`}
        >
            <div className='flex flex-col gap-3.5'>
                {access.loading && <LinesSkeleton lines={2} />}

                {!access.loading && access.error !== undefined && (
                    <div className='flex flex-col items-start gap-2'>
                        <InlineError>{copy(access.error)}</InlineError>
                        <Button size='sm' variant='secondary' onPress={access.reload}>Try again</Button>
                    </div>
                )}

                {!access.loading && access.error === undefined && access.data !== null && (
                    <>
                        <CopyField label='URL' value={access.data.accessUrl} />
                        <CopyField label='Password' value={access.data.password} />
                    </>
                )}

                <div className='flex flex-wrap items-center justify-end gap-2 pt-1'>
                    {onStop !== undefined && (
                        <Button variant='ghost' className='mr-auto' isPending={isStopping} onPress={onStop}>
                            <Square aria-hidden='true' />
                            Stop workspace
                        </Button>
                    )}
                    <Button variant='secondary' onPress={onClose}>Close</Button>
                    {access.data !== null && (
                        <a
                            href={access.data.accessUrl}
                            target='_blank'
                            rel='noreferrer'
                            className={cn(buttonVariants({ variant: 'primary' }), 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent')}
                        >
                            Open VS Code
                            <ArrowUpRight aria-hidden='true' />
                        </a>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default CodespaceAccessDialog;
