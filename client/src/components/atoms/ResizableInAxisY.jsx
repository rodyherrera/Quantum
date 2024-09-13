/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

import { useEffect, useState } from 'react';
import { useLockBodyScroll, useToggle } from 'react-use';

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
    const [locked, toggleLocked] = useToggle(false)
    useLockBodyScroll(locked);

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
            toggleLocked(false);
            document.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('touchmove', handleTouchMove);
        };

        const handleTouchMove = (e) => {
            const newNodeHeight = window.innerHeight - e.touches[0].clientY;
            const headerEl = document.querySelector('#QuantumCloud-ROOT .Header');
            const maxHeight = window.innerHeight - headerEl.clientHeight;
            const { minHeight } = sanitizeHeightLimits();
            if(newNodeHeight > maxHeight || newNodeHeight < minHeight) return;
            callback(newNodeHeight);
            setNodeHeight(newNodeHeight);
        };

        const handleTouchStart = () => {
            toggleLocked(true);
            document.addEventListener('touchend', handleTouchEnd);
            document.addEventListener('touchmove', handleTouchMove);
        };

        const handleMouseUp = () => {
            document.querySelector('body').style.userSelect = 'unset';
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
            callback(newNodeHeight);
            setNodeHeight(newNodeHeight);
        };

        const handleOnMouseDown = () => {
            document.querySelector('body').style.userSelect = 'none';
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('mousemove', handleMouseMove);
        };

        if(triggerNodeRef.current){
            triggerNodeRef.current.addEventListener('mousedown', handleOnMouseDown);
            triggerNodeRef.current.addEventListener('touchstart', handleTouchStart); 
        }

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('touchmove', handleTouchMove);
        };
    }, [maxHeight, minHeight, triggerNodeRef, callback]);

    return children;
};

export default ResizableInAxisY;