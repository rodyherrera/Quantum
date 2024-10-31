import React, { useState, useRef, forwardRef, useEffect, useId } from 'react';
import ReactDOM from 'react-dom';
import { MdKeyboardArrowDown } from 'react-icons/md';
import './Select.css';

const Select = forwardRef(({ 
    options, 
    containerProps = {}, 
    inputProps = {}, 
    placeholder, 
    helperText, 
    onSelect 
}, ref) => {
    const [isOpenSelect, setIsOpenSelect] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectOptions, setSelectOptions] = useState(options);
    const [selectPosition, setSelectPosition] = useState({ top: 0, left: 0, width: 0 });
    const inputRef = useRef(null);
    const optionsContainerRef = useRef(null);

    const handleOpenSelect = () => {
        const rect = inputRef.current.getBoundingClientRect();
        setSelectPosition({
            top: rect.top + window.scrollY + rect.height,
            left: rect.left + window.scrollX,
            width: rect.width
        });
        setIsOpenSelect(prevState => !prevState);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(optionsContainerRef.current && !optionsContainerRef.current.contains(event.target)){
                setIsOpenSelect(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [optionsContainerRef]);

    useEffect(() => {
        if(!searchTerm){
            setSelectOptions(options);
        }else{
            setSelectOptions(options.filter(([_, item]) =>
                item.toLowerCase().includes(searchTerm.toLowerCase())
            ));
        }
    }, [searchTerm, options]);

    const onChangeHandler = (e) => {
        setSearchTerm(e.target.value);
        onSelect(e.target.value);
    };

    const handleOptionClick = (value, item) => {
        if(inputRef.current){
            inputRef.current.value = item;
        }
        if(onSelect){
            onSelect(value);
        }
        setIsOpenSelect(false);
    };

    return (
        <div className='Select-Container-Wrapper' ref={ref}>
            <div className='Select-Container' {...containerProps}>
                <input
                    ref={inputRef}
                    readOnly={false}
                    onChange={onChangeHandler}
                    placeholder={placeholder}
                    className='Select-Input'
                    onClick={handleOpenSelect}
                    {...inputProps}
                />
                <span className={isOpenSelect ? 'Select-Icon Active' : 'Select-Icon'}>
                    <MdKeyboardArrowDown />
                </span>
            </div>

            {isOpenSelect && ReactDOM.createPortal(
                <ul
                    className='Select-Options Active'
                    ref={optionsContainerRef}
                    style={{ 
                        top: `${selectPosition.top}px`, 
                        left: `${selectPosition.left}px`,
                        width: `${selectPosition.width}px`
                    }}
                >
                    {!selectOptions.length && (
                        <p className='Select-Empty-Records-Message'>No results found.</p>
                    )}
                    {selectOptions.map(([value, item], index) => (
                        <li 
                            className='Select-Option'
                            onClick={() => handleOptionClick(value, item)}
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
});

export default Select;
