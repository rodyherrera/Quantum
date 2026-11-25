import { Spinner } from '@heroui/react';
import { Check, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import type { SaveState } from '@/shared/contracts/form';

const LABEL: Record<SaveState, string> = {
    idle: 'Saved automatically',
    pending: 'Unsaved changes',
    saving: 'Saving…',
    saved: 'Saved',
    error: 'Could not save'
};

const ICON: Record<SaveState, ReactNode> = {
    idle: null,
    pending: <span aria-hidden='true' className='size-1.5 shrink-0 rounded-full bg-current' />,
    saving: <Spinner size='sm' color='current' />,
    saved: <Check aria-hidden='true' className='size-3.5 shrink-0' />,
    error: <TriangleAlert aria-hidden='true' className='size-3.5 shrink-0' />
};

interface SaveStatusProps{
    state: SaveState;
    className?: string;
}

const SaveStatus = ({ state, className = '' }: SaveStatusProps) => (
    <span
        aria-live='polite'
        className={`flex items-center gap-1.5 text-xs ${state === 'error' ? 'text-danger' : 'text-subtle'} ${className}`}
    >
        {ICON[state]}
        {LABEL[state]}
    </span>
);

export default SaveStatus;
