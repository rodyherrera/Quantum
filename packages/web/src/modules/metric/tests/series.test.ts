import { describe, expect, it } from 'vitest';
import { deltas } from '@/modules/metric/utils/series';

describe('deltas', () => {
    it('turns running totals into the amount between samples', () => {
        expect(deltas([100, 160, 160, 400])).toEqual([60, 0, 240]);
    });

    it('treats a counter reset as nothing transferred', () => {
        expect(deltas([500, 20, 70])).toEqual([0, 50]);
    });

    it('has nothing to say about fewer than two samples', () => {
        expect(deltas([])).toEqual([]);
        expect(deltas([42])).toEqual([]);
    });
});
