import { useCallback, useEffect, useRef, useState } from 'react';

/*
 * A form that saves on submit has nothing on screen that changes once it worked. This holds a
 * "saved" flag for a few seconds after each save, and drops the timer if the form goes away first.
 */
export const useSavedFlash = (durationMs = 3000): [boolean, () => void] => {
    const [saved, setSaved] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => () => clearTimeout(timer.current), []);

    const flash = useCallback(() => {
        clearTimeout(timer.current);
        setSaved(true);
        timer.current = setTimeout(() => setSaved(false), durationMs);
    }, [durationMs]);

    return [saved, flash];
};
