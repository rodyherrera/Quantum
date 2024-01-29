import React, { useEffect, useRef, useState } from 'react';
import ContextMenuOption from '@components/contextMenu/ContextMenuOption';
import './ContextMenu.css';

const ContextMenu = ({ options, children, ...props }) => {
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
    const contextMenuRef = useRef(null);

    useEffect(() => {
        const clickOutsideHandler = (e) => {
            if(contextMenuRef.current && !contextMenuRef.current.contains(e.target)){
                setIsContextMenuOpen(false);
            }
        };
        document.addEventListener('click', clickOutsideHandler);
        return () => {
            document.removeEventListener('click', clickOutsideHandler);
        };
    }, []);

    return (
        <div {...props} ref={contextMenuRef}>
            <div onClick={() => setIsContextMenuOpen(!isContextMenuOpen)}>
                {children}
            </div>
            {(isContextMenuOpen) && (
                <aside className='Context-Menu-Container'>
                    <ul className='Context-Menu-Options'>
                        {options.map(({ title, onClick, extend }, index) => (
                            <ContextMenuOption
                                key={index}
                                title={title}
                                onClick={onClick}
                                extend={extend}
                            />
                        ))}
                    </ul>
                </aside>  
            )}
        </div>
    );
};

export default ContextMenu;