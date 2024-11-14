import { useEffect, useRef } from 'react';

const useDocumentTitle = (title, retainOnUnmount = false) => {
    const defaultTitle = useRef(document.title);
    const suffix = 'Quantum Cloud';

    useEffect(() => {
        const newTitle = `${title} - ${suffix}`;
        if(document.title !== newTitle) {
            document.title = newTitle;
        }
        return () => {
            if(!retainOnUnmount){
                document.title = defaultTitle.current;
            }
        }
    }, [title, retainOnUnmount]);
};

export default useDocumentTitle;