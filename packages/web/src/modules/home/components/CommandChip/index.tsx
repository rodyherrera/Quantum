import CopyButton from '@/modules/home/components/CopyButton';

interface CommandChipProps{
    command: string;
}

const CommandChip = ({ command }: CommandChipProps) => (
    <span className='inline-flex h-8.5 min-w-0 max-w-full items-center gap-2.5 rounded-lg border border-border bg-surface-secondary pl-3 pr-0.5 font-mono text-xs text-muted'>
        <span aria-hidden='true' className='select-none text-subtle'>$</span>
        <code className='min-w-0 truncate text-foreground'>{command}</code>
        <CopyButton value={command} label='Copy the install command' />
    </span>
);

export default CommandChip;
