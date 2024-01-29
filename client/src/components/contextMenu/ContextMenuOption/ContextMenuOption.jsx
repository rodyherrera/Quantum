import React from 'react';
import './ContextMenuOption.css';

const ContextMenuOption = ({ onClick, title, ...props }) => {
    return (
        <React.Fragment>
            <li 
                className='Context-Menu-Option' 
                onClick={onClick}
                {...props}
            >
                <span className='Context-Menu-Option-Title'>{title}</span>
            </li>
        </React.Fragment>
    );
};

export default ContextMenuOption;