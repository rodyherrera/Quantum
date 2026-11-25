export const count = (value: number): string => value.toLocaleString('en-US');

export const rate = (value: number): string => Number.isInteger(value)
    ? count(value)
    : value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const share = (part: number, whole: number): string =>
    whole === 0 ? '0%' : `${Math.round((part / whole) * 100)}%`;
