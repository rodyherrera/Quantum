import { useEffect, useState } from 'react';

const ResizableInAxisY = ({
    initialHeight,
    maxHeight,
    minHeight,
    containerRef,
    triggerNodeRef,
    callback,
    children
}) => {
    const [nodeHeight, setNodeHeight] = useState(initialHeight);

    const setOverflowToParentNodes = (overflow, overscrollBehavior) => {
        const setOverflow = (elementId) => {
            const element = document.getElementById(elementId);
            if(element){
                element.style.overflow = overflow;
                if(overscrollBehavior){
                    element.style.overscrollBehavior = overscrollBehavior;
                }
            }
        };
        setOverflow('QuantumCloud-ROOT');
        setOverflow('QuauntumCloud-Body');
    };

    useEffect(() => {
        if(containerRef.current){
            containerRef.current.style.height = `${nodeHeight}px`;
        }
    }, [nodeHeight, containerRef]);

    useEffect(() => {
        const sanitizeHeightLimits = () => {
            const getMaxMinHeight = (ref) => (ref?.current ? ref.current.clientHeight : undefined);
            const sanitizedMaxHeight = window.innerHeight - getMaxMinHeight(maxHeight);
            const sanitizedMinHeight = getMaxMinHeight(minHeight);
            return { maxHeight: sanitizedMaxHeight, minHeight: sanitizedMinHeight };
        };

        const handleTouchEnd = () => {
            setOverflowToParentNodes('scroll', 'auto');
            document.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('touchmove', handleTouchMove);
        };

        const handleTouchMove = (e) => {
            const newNodeHeight = window.innerHeight - e.touches[0].clientY;
            const headerEl = document.querySelector('#QuantumCloud-ROOT .Header');
            const maxHeight = window.innerHeight - headerEl.clientHeight;
            const { minHeight } = sanitizeHeightLimits();
            if(newNodeHeight > maxHeight || newNodeHeight < minHeight) return;
            callback();
            setNodeHeight(newNodeHeight);
        };

        const handleTouchStart = () => {
            setOverflowToParentNodes('hidden', 'none');
            document.addEventListener('touchend', handleTouchEnd);
            document.addEventListener('touchmove', handleTouchMove);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousemove', handleMouseMove);
        };

        const handleMouseMove = (e) => {
            const newNodeHeight = window.innerHeight - e.clientY;
            const { maxHeight, minHeight } = sanitizeHeightLimits();
            if(
                (maxHeight && newNodeHeight > maxHeight) || 
                (minHeight && newNodeHeight < minHeight)
            ){
                return;
            }
            callback();
            setNodeHeight(newNodeHeight);
        };

        const handleOnMouseDown = () => {
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('mousemove', handleMouseMove);
        };

        if(triggerNodeRef.current){
            triggerNodeRef.current.addEventListener('mousedown', handleOnMouseDown);
            triggerNodeRef.current.addEventListener('touchstart', handleTouchStart); 
        }

        return () => {
            setOverflowToParentNodes('scroll', 'auto');
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('touchmove', handleTouchMove);
        };
    }, [maxHeight, minHeight, triggerNodeRef, callback]);

    return children;
};

export default ResizableInAxisY;