interface GuideTextProps{
    text: string;
}

const GuideText = ({ text }: GuideTextProps) => (
    <>
        {text.split('`').map((part, index) => (index % 2 === 1
            ? <code key={`${index}-${part}`} className='rounded-[0.25rem] border border-separator bg-surface-secondary px-1 py-px font-mono text-xs text-foreground'>{part}</code>
            : part))}
    </>
);

export default GuideText;
