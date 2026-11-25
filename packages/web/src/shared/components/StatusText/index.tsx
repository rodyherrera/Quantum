import { cn } from '@heroui/react';
import { STATUS_TONE } from '@/shared/utils/status-tone';
import type { StatusColor } from '@/shared/utils/status';

interface StatusTextProps{
    color: StatusColor;
    label: string;
    className?: string;
}

const StatusText = ({ color, label, className }: StatusTextProps) => (
    <span className={cn('whitespace-nowrap', STATUS_TONE[color], className)}>{label}</span>
);

export default StatusText;
