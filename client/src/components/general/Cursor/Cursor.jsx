import React, { useEffect, useRef } from 'react';
import './Cursor.css';

const Cursor = ({ children }) => {
    const cursor = useRef(null);
    const lastHoveredElement = useRef(null);

    const mouseMoveHandler = (e) => {
        // Update the cursor
        const offset = 16;
        const y = (e.clientY - offset);
        const x = (e.clientX - offset);
        cursor.current.style.top = y + 'px';
        cursor.current.style.left = x + 'px';

        // Getting the hovered element using the client cursor coordinates.
        const hoveredElement = document.elementFromPoint(x, y);

        // Check if the current element or some parent node has the Hover-Target class
        let isHoverTarget = false;
        let currentElement = hoveredElement;
        while(currentElement){
            if(currentElement.classList && currentElement.classList.contains('Hover-Target')){
                isHoverTarget = true;
                break;
            }
            currentElement = currentElement.parentElement;
        }

        cursor.current.classList[(isHoverTarget) ? ('add') : ('remove')]('Hover');

        // Check if the cursor has left the previous suspended element
        if(lastHoveredElement.current && lastHoveredElement.current !== hoveredElement){
            cursor.current.classList.remove('Hover');
        }

        lastHoveredElement.current = hoveredElement;
    };

    useEffect(() => {
        document.addEventListener('mousemove', mouseMoveHandler);

        return () => {
            document.removeEventListener('mousemove', mouseMoveHandler)
        };
    }, []);

    return (
        <React.Fragment>
            <div ref={cursor} id='Cursor' />

            {children}
        </React.Fragment>
    );
};

export default Cursor;