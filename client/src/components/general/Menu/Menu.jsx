import React from 'react';
import Button from '@components/general/Button';
import Header from '@components/general/Header';
import './Menu.css';

const Menu = () => {
    return (
        <aside id='Menu-Container'>
            <Header />

            <ul id='Menu-Items-Container'>
                {['Home', 'Dashboard', 'Create Repository', 'Documentation', 'Github'].map((item, index) => (
                    <li className='Menu-Item-Container'>
                        <h3 className='Menu-Item-Title'>{item}</h3>
                    </li>
                ))}
            </ul>
            
            <article id='Menu-Bottom-Container'>
                <Button title='Source Code' />
                <Button variant='Contained' title='Donate' />
            </article>
        </aside>
    );
};

export default Menu;