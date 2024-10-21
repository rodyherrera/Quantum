import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import ContextMenuOption from '@components/atoms/ContextMenuOption';
import './ContextMenu.css';

const ContextMenu = ({ options, children, ...props }) => {
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
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

    const handleContextMenu = () => {
        if(contextMenuRef.current){
            const rect = contextMenuRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.top + window.scrollY + 16,
                left: rect.left + window.scrollX - 128
            });
        }
        setIsContextMenuOpen(!isContextMenuOpen);
    };

    return (
        <div {...props} ref={contextMenuRef}>
            <div onClick={handleContextMenu}>
                {children}
            </div>

            {isContextMenuOpen &&
                ReactDOM.createPortal(
                    <aside
                        className='Context-Menu-Container'
                        style={{ 
                            top: `${menuPosition.top}px`, 
                            left: `${menuPosition.left}px`,
                        }}
                    >
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
                    </aside>,
                    document.getElementById('QuantumCloud-ROOT')
                )}
        </div>
    );
};

export default ContextMenu;
