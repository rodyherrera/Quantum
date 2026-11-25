import { Button, Spinner } from '@heroui/react';
import { TriangleAlert } from 'lucide-react';
import type { ReactNode, Ref } from 'react';

interface TerminalFrameProps{
    title: string;
    description: string;
    connection?: string;
    actions?: ReactNode;
    error: string | null;
    onDismissError: () => void;
    containerRef: Ref<HTMLDivElement>;
}

/* The chrome around an xterm: what it is, how the connection is doing, and the dark screen itself. */
const TerminalFrame = ({ title, description, connection, actions, error, onDismissError, containerRef }: TerminalFrameProps) => (
    <div className='flex min-h-0 flex-1 flex-col gap-3'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='min-w-0'>
                <h3 className='font-medium text-foreground'>{title}</h3>
                <p className='text-subtle'>{description}</p>
            </div>

            <div className='flex flex-wrap items-center gap-2'>
                {connection !== undefined && (
                    <span className='flex items-center gap-2 text-xs text-subtle'>
                        <Spinner size='sm' color='current' />
                        {connection}
                    </span>
                )}

                {actions}
            </div>
        </div>

        {error !== null && (
            <div role='alert' className='flex items-center justify-between gap-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-danger'>
                <span className='flex items-center gap-2'>
                    <TriangleAlert className='size-4 shrink-0' aria-hidden='true' />
                    {error}
                </span>
                <Button size='sm' variant='secondary' onPress={onDismissError}>Dismiss</Button>
            </div>
        )}

        <div className='flex min-h-[24rem] flex-1 flex-col overflow-hidden rounded-lg border border-separator bg-terminal xl:min-h-0'>
            <div ref={containerRef} className='min-h-0 flex-1 overflow-hidden p-3' />
        </div>
    </div>
);

export default TerminalFrame;
