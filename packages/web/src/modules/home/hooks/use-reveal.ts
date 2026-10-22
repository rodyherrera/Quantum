import { useEffect, useRef } from 'react';

const PENDING = '.lp-reveal:not([data-shown])';

export const useReveal = <T extends HTMLElement>() => {
    const root = useRef<T | null>(null);

    useEffect(() => {
        const container = root.current;
        if(container === null) return;

        container.dataset.reveal = 'true';

        const watcher = new IntersectionObserver((entries) => {
            for(const entry of entries){
                if(!entry.isIntersecting) continue;

                (entry.target as HTMLElement).dataset.shown = 'true';
                watcher.unobserve(entry.target);
            }
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

        const observePending = () => {
            for(const element of container.querySelectorAll(PENDING)) watcher.observe(element);
        };

        observePending();

        const additions = new MutationObserver(observePending);
        additions.observe(container, { childList: true, subtree: true });

        return () => {
            additions.disconnect();
            watcher.disconnect();
        };
    }, []);

    return root;
};
