interface GuideTextProps{
    text: string;
}

const GuideText = ({ text }: GuideTextProps) => (
    <>
        {text.split('`').map((part, index) => (index % 2 === 1
            ? <code key={`${index}-${part}`} className='lp-code'>{part}</code>
            : part))}
    </>
);

export default GuideText;
