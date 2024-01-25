import React from 'react';
import Button from '@components/general/Button';
import Header from '@components/general/Header';
import Banner from '@components/general/Banner';
import './Menu.css';

const Menu = () => {
    return (
        <aside className='Menu-Container'>
            <article className='Menu-Header-Container'>
                <Banner text='We streamline and automate your deployments 🔥' />
                <Header />
            </article>

            <ul className='Menu-Items-Container'>
                {['Home', 'Dashboard', 'Create Repository', 'Documentation', 'Github'].map((item, index) => (
                    <li className='Menu-Item-Container'>
                        <h3 className='Menu-Item-Title'>{item}</h3>
                    </li>
                ))}
            </ul>
            
            <article className='Menu-Bottom-Container'>
                <Button title='Source Code' />
                <Button variant='Contained' title='Donate' />
            </article>
        </aside>
    );
};

export default Menu;