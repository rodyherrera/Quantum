import React, { useEffect } from 'react';
import './ContextMenu.css';

const ContextMenu = ({ options, children, ...props }) => {
    const [isContextMenuOpen, setIsContextMenuOpen] = React.useState(false);

    useEffect(() => {
        const handleOnClick = (e) => {
            if(!e.target.className.includes('Context-Menu-Container') && !e.target.className.includes('Context-Menu-Option'))
                setIsContextMenuOpen(false);
        };
        document.addEventListener('click', handleOnClick);
        return () => document.removeEventListener('click', handleOnClick);
    }, []);

    return (
        <div {...props}>
            <div onClick={() => setIsContextMenuOpen(!isContextMenuOpen)}>
                {children}
            </div>
            {(isContextMenuOpen) && (
                <aside className='Context-Menu-Container'>
                    <ul className='Context-Menu-Options'>
                        {options.map((option, index) => (
                            <li className='Context-Menu-Option' key={index} onClick={option.onClick}>
                                <span className='Context-Menu-Option-Title'>{option.title}</span>
                            </li>
                        ))}
                    </ul>
                </aside>  
            )}
        </div>
    );
};

export default ContextMenu;