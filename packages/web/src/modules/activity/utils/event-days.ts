import { formatDay } from '@/shared/utils/format-date';
import type { ActivityEvent } from '@quantum/contracts/modules/activity/domain';

export interface EventDay{
    key: string;
    label: string;
    events: ActivityEvent[];
}

const dayKey = (date: Date): string => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const dayLabel = (ts: string, now: Date): string => {
    const key = dayKey(new Date(ts));
    if(key === dayKey(now)) return 'Today';
    if(key === dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))) return 'Yesterday';
    return formatDay(ts);
};

/* Splits a newest-first feed into one group per local calendar day, keeping its order. */
export const groupByDay = (events: ActivityEvent[], now = new Date()): EventDay[] => {
    const days = new Map<string, EventDay>();

    for(const event of events){
        const key = dayKey(new Date(event.ts));
        const day = days.get(key) ?? { key, label: dayLabel(event.ts, now), events: [] };
        day.events.push(event);
        days.set(key, day);
    }

    return [...days.values()];
};
