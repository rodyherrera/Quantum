import { useEffect } from 'react';

const SHEETS = 'style, link[rel="stylesheet"]';

export const useMirroredStyles = (target: Document | null) => {
    useEffect(() => {
        if(target === null) return;

        const copies = new Map<Element, Element>();

        const sync = () => {
            const sources = [...document.head.querySelectorAll(SHEETS)];

            for(const [source, copy] of copies){
                if(sources.includes(source)) continue;

                copy.remove();
                copies.delete(source);
            }

            for(const source of sources){
                const copy = copies.get(source);

                if(copy === undefined){
                    const fresh = source.cloneNode(true) as Element;
                    target.head.append(fresh);
                    copies.set(source, fresh);
                }else if(copy.textContent !== source.textContent){
                    copy.textContent = source.textContent;
                }
            }
        };

        sync();

        const watcher = new MutationObserver(sync);
        watcher.observe(document.head, { childList: true, subtree: true, characterData: true });

        return () => watcher.disconnect();
    }, [target]);
};
