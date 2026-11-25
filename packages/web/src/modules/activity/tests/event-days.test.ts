import { describe, expect, it } from 'vitest';
import { groupByDay } from '@/modules/activity/utils/event-days';
import { ActivityLevel } from '@quantum/contracts/modules/activity/domain';
import type { ActivityEvent } from '@quantum/contracts/modules/activity/domain';

const NOW = new Date(2026, 8, 6, 15, 0);

const at = (id: number, date: Date): ActivityEvent => ({
    id,
    organizationId: 1,
    userId: 1,
    scope: null,
    level: ActivityLevel.Info,
    title: `event-${id}`,
    message: '',
    source: null,
    correlationId: null,
    meta: {},
    ts: date.toISOString(),
    createdAt: date.toISOString(),
    updatedAt: date.toISOString()
});

describe('events by day', () => {
    it('names today and yesterday, and dates anything older', () => {
        const days = groupByDay([
            at(1, new Date(2026, 8, 6, 14, 30)),
            at(2, new Date(2026, 8, 6, 0, 5)),
            at(3, new Date(2026, 8, 5, 23, 55)),
            at(4, new Date(2026, 8, 2, 9, 0))
        ], NOW);

        expect(days.map((day) => day.label)).toEqual(['Today', 'Yesterday', 'Sep 2']);
        expect(days.map((day) => day.events.map((event) => event.id))).toEqual([[1, 2], [3], [4]]);
    });

    it('keeps one group per day even when the feed is out of order', () => {
        const days = groupByDay([
            at(1, new Date(2026, 8, 6, 9, 0)),
            at(2, new Date(2026, 8, 5, 9, 0)),
            at(3, new Date(2026, 8, 6, 8, 0))
        ], NOW);

        expect(days.map((day) => day.events.map((event) => event.id))).toEqual([[1, 3], [2]]);
    });
});
