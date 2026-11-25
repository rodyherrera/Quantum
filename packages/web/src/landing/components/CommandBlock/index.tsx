import { Fragment } from 'react';
import CopyButton from '@/landing/components/CopyButton';
import { CARD, CARD_LABEL } from '@/landing/utils/classes';

interface CommandBlockProps{
    command: string | string[];
    label?: string;
    isPrompted?: boolean;
}

const CommandBlock = ({ command, label, isPrompted = true }: CommandBlockProps) => {
    const lines = typeof command === 'string' ? [command] : command;
    const value = lines.join('\n');
    const copy = <CopyButton value={value} label={label === undefined ? 'Copy the command' : `Copy: ${label}`} />;

    return (
        <figure className={`${CARD} m-0`}>
            {label !== undefined && (
                <figcaption className={`${CARD_LABEL} py-0.5 pr-0.5`}>
                    <span className='min-w-0 truncate'>{label}</span>
                    {copy}
                </figcaption>
            )}

            <div className='flex items-start'>
                <pre className='m-0 min-w-0 flex-1 overflow-x-auto px-3.5 py-2.5 font-mono text-xs leading-[1.7] text-foreground'>
                    <code>
                        {lines.map((line, index) => (
                            <Fragment key={`${index}-${line}`}>
                                {index > 0 && '\n'}
                                {isPrompted && <span aria-hidden='true' className='select-none text-subtle'>$ </span>}
                                {line}
                            </Fragment>
                        ))}
                    </code>
                </pre>

                {label === undefined && <span className='p-1'>{copy}</span>}
            </div>
        </figure>
    );
};

export default CommandBlock;
