import type { StatusColor } from '@/shared/utils/status';

/* Status reads as coloured text and nothing else: no dot, no ring, no badge. */
export const STATUS_TONE: Record<StatusColor, string> = {
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    accent: 'text-foreground',
    default: 'text-muted'
};
