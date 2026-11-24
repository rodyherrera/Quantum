const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });

export const formatDate = (iso: string): string => {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? '—' : formatter.format(date);
};

const dayFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

export const formatDay = (iso: string): string => {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? '—' : dayFormatter.format(date);
};

const clockFormatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' });

export const formatClock = (iso: string): string => {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? '—' : clockFormatter.format(date);
};
