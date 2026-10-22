import { useEffect } from 'react';
import type { RefObject } from 'react';

const TOP_ZONE = 8;

export const useScrolled = (target: RefObject<HTMLElement | null>) => {
    useEffect(() => {
        const element = target.current;
        if(element === null) return;

        const update = () => {
            element.dataset.scrolled = String(window.scrollY > TOP_ZONE);
        };

        update();
        window.addEventListener('scroll', update, { passive: true });
        return () => window.removeEventListener('scroll', update);
    }, [target]);
};
