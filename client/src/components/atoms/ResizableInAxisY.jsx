import { useEffect, useState, useCallback } from 'react';
import { useLockBodyScroll, useToggle } from 'react-use';


const ResizableInAxisY = ({
    initialHeight,
    maxHeight,
    minHeight,
    containerRef,
    triggerNodeRef,
    callback,
    children,
}) => {
    const [nodeHeight, setNodeHeight] = useState(initialHeight);
    const [locked, toggleLocked] = useToggle(false);
    useLockBodyScroll(locked);

    const sanitizeHeightLimits = useCallback(() => {
        const getMaxMinHeight = (ref) => ref?.current?.clientHeight || 0;
        const sanitizedMaxHeight = window.innerHeight - getMaxMinHeight(maxHeight);
        const sanitizedMinHeight = getMaxMinHeight(minHeight);
        return { maxHeight: sanitizedMaxHeight, minHeight: sanitizedMinHeight };
    }, [maxHeight, minHeight]);

    useEffect(() => {
        if(containerRef.current){
            containerRef.current.style.height = `${nodeHeight}px`;
        }
    }, [nodeHeight, containerRef]);

    useEffect(() => {
        let isTouch = false;
        const updateHeight = (clientY) => {
            const newHeight = window.innerHeight - clientY;
            const { maxHeight, minHeight } = sanitizeHeightLimits();
            if((maxHeight && newHeight > maxHeight) || (minHeight && newHeight < minHeight)){
                return;
            }
            setNodeHeight(newHeight);
            callback(newHeight);
        };

        const handleMove = (e) => {
            const clientY = isTouch ? e.touches[0].clientY : e.clientY;
            updateHeight(clientY);
        };

        const handleEnd = () => {
            if(isTouch){
                toggleLocked(false);
                document.removeEventListener('touchmove', handleMove);
                document.removeEventListener('touchend', handleEnd);
            }else{
                document.body.style.userSelect = '';
                document.removeEventListener('mousemove', handleMove);
                document.removeEventListener('mouseup', handleEnd);
            }
        };

        const handleStart = (e) => {
            isTouch = e.type === 'touchstart';
            if(isTouch){
                toggleLocked(true);
                document.addEventListener('touchmove', handleMove);
                document.addEventListener('touchend', handleEnd);
            }else{
                document.body.style.userSelect = 'none';
                document.addEventListener('mousemove', handleMove);
                document.addEventListener('mouseup', handleEnd);  
            }
        };

        const triggerNode = triggerNodeRef.current;
        if(triggerNode){
            triggerNode.addEventListener('mousedown', handleStart);
            triggerNode.addEventListener('touchstart', handleStart);
        }

        return () => {
            if(triggerNode){
                triggerNode.removeEventListener('mousedown', handleStart);
                triggerNode.removeEventListener('touchstart', handleStart);
            }
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
        }
    }, [sanitizeHeightLimits, triggerNodeRef, callback, toggleLocked]);

    return children;
};

export default ResizableInAxisY;