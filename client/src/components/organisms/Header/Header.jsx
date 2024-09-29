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

import React, { useRef } from 'react';
import { HeaderLinks, HeaderNavigation } from '@components/molecules/Header';
import HeaderBrand from '@components/atoms/HeaderBrand';
import './Header.css';

const Header = () => {
    const headerRef = useRef(null);

    return (
        <header className='Header' ref={headerRef}>
            <section className='Header-Left-Container Header-Child-Container'>
                <HeaderBrand />
            </section>
            <section className='Header-Center-Container Header-Child-Container'>
                <HeaderLinks />
            </section>
            <section className='Header-Right-Container Header-Child-Container'>
                <HeaderNavigation />
            </section>
        </header>
    );
};

export default Header;