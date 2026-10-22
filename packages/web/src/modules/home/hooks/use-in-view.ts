import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

interface InViewOptions{
    margin?: string;
    once?: boolean;
}

export const useInView = (target: RefObject<HTMLElement | null>, { margin = '0px', once = false }: InViewOptions = {}): boolean => {
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const element = target.current;
        if(element === null || (once && inView)) return;

        const watcher = new IntersectionObserver((entries) => {
            const isIntersecting = entries.some((entry) => entry.isIntersecting);
            if(once && !isIntersecting) return;
            setInView(isIntersecting);
        }, { rootMargin: margin });

        watcher.observe(element);
        return () => watcher.disconnect();
    }, [target, margin, once, inView]);

    return inView;
};
