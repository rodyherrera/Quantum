/*
 * Network counters grow from the moment a container starts. What happened between two samples is
 * the difference; a restart resets the counter, so a negative step counts as nothing.
 */
export const deltas = (totals: number[]): number[] =>
    totals.slice(1).map((total, index) => Math.max(0, total - (totals[index] ?? 0)));
