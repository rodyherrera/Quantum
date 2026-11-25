import type { SaveState } from '@/shared/contracts/form';

const LABEL: Record<SaveState, string> = {
    idle: 'Saved automatically',
    pending: 'Unsaved changes',
    saving: 'Saving…',
    saved: 'Saved',
    error: 'Could not save'
};

interface SaveStatusProps{
    state: SaveState;
    className?: string;
}

const SaveStatus = ({ state, className = '' }: SaveStatusProps) => (
    <span
        aria-live='polite'
        className={`text-xs ${state === 'error' ? 'text-danger' : 'text-subtle'} ${className}`}
    >
        {LABEL[state]}
    </span>
);

export default SaveStatus;
