import CopyButton from '@/modules/home/components/CopyButton';

interface CommandBlockProps{
    command: string;
    label?: string;
    isPrompted?: boolean;
}

const CommandBlock = ({ command, label, isPrompted = true }: CommandBlockProps) => (
    <figure className='flex min-w-0 flex-col gap-2'>
        {label !== undefined && <figcaption className='label-caps lp-dim'>{label}</figcaption>}

        <div className='lp-command'>
            <pre>
                {isPrompted && <span aria-hidden='true' className='lp-faint select-none'>$ </span>}
                <code>{command}</code>
            </pre>

            <CopyButton value={command} />
        </div>
    </figure>
);

export default CommandBlock;
