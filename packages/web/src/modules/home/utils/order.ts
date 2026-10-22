import type { CSSProperties } from 'react';

export const order = (index: number): CSSProperties => ({ '--lp-i': index } as CSSProperties);
