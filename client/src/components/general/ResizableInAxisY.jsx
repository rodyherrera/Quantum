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
        const quantumROOT = document.getElementById('QuantumCloud-ROOT');
        const bodyEl = document.getElementById('QuauntumCloud-Body');
        const htmlEl = document.getElementById('QuantumCloud-HTML');
        if(!quantumROOT || !bodyEl || !htmlEl) return;
        quantumROOT.style.overflow = overflow;
        bodyEl.style.overflow = overflow;
        htmlEl.style.overflow = overflow;
        htmlEl.style.overscrollBehavior = overscrollBehavior;
    };

    useEffect(() => {
        if(!containerRef.current) return;
        containerRef.current.style.height = nodeHeight + 'px';
    }, [nodeHeight]);

    useEffect(() => {
        const sanitizeHeightLimits = () => {
            if(maxHeight?.current) maxHeight = maxHeight.current.clientHeight;
            if(minHeight?.current) minHeight = minHeight.current.clientHeight;
            return { maxHeight, minHeight };
        };

        const handleTouchEnd = () => {
            setOverflowToParentNodes('scroll', 'auto');
            document.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('touchmove', handleTouchMove);
        };

        const handleTouchMove = (e) => {
            const newNodeHeight = (window.innerHeight - e.touches[0].clientY);
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
            const newNodeHeight = (window.innerHeight - e.clientY);
            const { maxHeight, minHeight } = sanitizeHeightLimits();
            if(
                (maxHeight && newNodeHeight > maxHeight) ||
                (minHeight && newNodeHeight < minHeight)
            ){
                return;
            }else{
                callback();
                setNodeHeight(newNodeHeight);
            }
        };

        const handleOnMouseDown = () => {
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('mousemove', handleMouseMove);
        };

        if(!triggerNodeRef.current) return;
        
        triggerNodeRef.current.addEventListener('mousedown', handleOnMouseDown);
        triggerNodeRef.current.addEventListener('touchstart', handleTouchStart);

        return () => {
            setOverflowToParentNodes('scroll', 'auto');
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    return children;
};

export default ResizableInAxisY;