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