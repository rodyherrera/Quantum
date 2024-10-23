import { useEffect } from 'react';

const useKeyPress = (keyCombo, callback) => {
    const keyPressHandler = (e) => {
        const keys = {
            Control: e.ctrlKey,
            Shift: e.shiftKey,
            Alt: e.altKey,
            // MacOS command key
            Meta: e.metaKey
        }
        const pressedKey = e.key.toLowerCase();
        const combo = keyCombo.toLowerCase().split('+');
        const isValidCombo = combo.every((key) => {
            return keys[combo] || key === pressedKey;
        });
        if(isValidCombo) callback(e);
    };

    useEffect(() => {
        window.addEventListener('keydown', keyPressHandler);
        return () => {
            window.removeEventListener('keydown', keyPressHandler);
        };
    }, [keyCombo, callback]);
};

export default useKeyPress;