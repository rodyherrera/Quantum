interface QuantumMarkProps{
    className?: string;
}

const QuantumMark = ({ className }: QuantumMarkProps) => (
    <svg viewBox='0 0 24 24' aria-hidden='true' fill='none' stroke='currentColor' strokeWidth='1.6' className={className}>
        <ellipse cx='12' cy='12' rx='10' ry='4.2' transform='rotate(32 12 12)' />
        <ellipse cx='12' cy='12' rx='10' ry='4.2' transform='rotate(-32 12 12)' />
        <circle cx='12' cy='12' r='2.1' fill='currentColor' stroke='none' />
    </svg>
);

export default QuantumMark;
