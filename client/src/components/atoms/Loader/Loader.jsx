import React from 'react';
import './Loader.css';

const Loader = ({ scale }) => {
    const loaderItems = Array.from({ length: 12 }, (_, index) => index + 1);

    return (
        <div className='Loader-Container'>
            <div className='Loader' style={{ transform: 'scale(' + scale + ')' }}>
                {loaderItems.map((item) => (
                    <div 
                        key={item}
                        className={`Loader-Item Loader-Item-${item}`} />
                ))}
            </div>
        </div>
    );
};

export default Loader;