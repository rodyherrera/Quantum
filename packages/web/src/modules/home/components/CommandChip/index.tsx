import CopyButton from '@/modules/home/components/CopyButton';

interface CommandChipProps{
    command: string;
}

/* One line of shell on the hero's blue field, so it keeps its own dark ink in either theme. */
const CommandChip = ({ command }: CommandChipProps) => (
    <span className='inline-flex h-9 min-w-0 max-w-full items-center gap-2.5 bg-[#05060a]/85 pl-3.5 pr-0.5 font-mono text-xs text-white/60 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)] backdrop-blur-sm'>
        <span aria-hidden='true' className='select-none'>$</span>
        <code className='min-w-0 truncate text-white'>{command}</code>
        <CopyButton value={command} label='Copy the install command' className='text-white/60 hover:bg-white/10 hover:text-white' />
    </span>
);

export default CommandChip;
