import { useEffect } from 'react';

const useKeyPress = (keyCombo, callback) => {
    useEffect(() => {
        const keyPressHandler = (e) => {
            if(!e.key) return;
            const keys = {
                control: e.ctrlKey,
                shift: e.shiftKey,
                alt: e.altKey,
                meta: e.metaKey
            };
            const pressedKey = e.key.toLowerCase();
            const combo = keyCombo.toLowerCase().split('+');
            const isValidCombo = combo.every((key) => {
                return keys[key] || key === pressedKey;
            });
            if(isValidCombo) callback(e);
        };

        window.addEventListener('keydown', keyPressHandler);
        return () => {
            window.removeEventListener('keydown', keyPressHandler);
        };
    }, [keyCombo, callback]);
};

export default useKeyPress;
