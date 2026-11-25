import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

export const useCurrentStep = (list: RefObject<HTMLElement | null>, steps: string): string | null => {
    const [current, setCurrent] = useState<string | null>(null);

    useEffect(() => {
        const element = list.current;
        if(element === null) return;

        const observer = new IntersectionObserver((entries) => {
            const entry = entries.find((candidate) => candidate.isIntersecting);
            if(entry !== undefined) setCurrent(entry.target.getAttribute('data-step'));
        }, { rootMargin: '-30% 0px -65% 0px' });

        element.querySelectorAll('[data-step]').forEach((step) => observer.observe(step));
        return () => observer.disconnect();
    }, [list, steps]);

    return current;
};
