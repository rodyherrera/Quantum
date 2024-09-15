import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { MdKeyboardArrowDown } from 'react-icons/md';
import './Select.css';

const Select = ({ options, containerProps = {}, inputProps = {}, placeholder, helperText, onSelect }) => {
    const [isOpenSelect, setIsOpenSelect] = useState(false);
    const [selectPosition, setSelectPosition] = useState({ top: 0, left: 0, width: 0 });
    const inputRef = useRef(null);

    const handleOpenSelect = () => {
        const rect = inputRef.current.getBoundingClientRect();
        setSelectPosition({
            top: rect.top + window.scrollY + rect.height,
            left: rect.left + window.scrollX,
            width: rect.width
        });
        setIsOpenSelect(!isOpenSelect);
    };

    return (
        <div className='Select-Container-Wrapper'>
            <div className='Select-Container' {...containerProps}>
                <input
                    ref={inputRef}
                    readOnly={true}
                    placeholder={placeholder}
                    className='Select-Input'
                    onClick={handleOpenSelect}
                    onBlur={() => setIsOpenSelect(false)}
                    {...inputProps}
                />
                <span className={(isOpenSelect) ? 'Select-Icon Active' : 'Select-Icon'}>
                    <MdKeyboardArrowDown />
                </span>
            </div>

            {isOpenSelect && ReactDOM.createPortal(
                <ul
                    className='Select-Options Active'
                    style={{ 
                        top: `${selectPosition.top}px`, 
                        left: `${selectPosition.left}px`,
                        width: `${selectPosition.width}px`
                    }}
                >
                    {options.map(([value, item], index) => (
                        <li 
                            className='Select-Option'
                            onClick={() => {
                                inputRef.current.value = item;
                                if(onSelect) {
                                    onSelect(value);
                                }
                                setIsOpenSelect(false);
                            }}
                            key={index}
                        >
                            {item}
                        </li>
                    ))}
                </ul>,
                document.getElementById('QuantumCloud-ROOT') 
            )}

            {helperText && (
                <div className='Input-Helper-Text-Container'>
                    <p className='Input-Helper-Text'>{helperText}</p>
                </div>
            )}
        </div>
    );
};

export default Select;
