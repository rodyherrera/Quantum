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

import React from 'react';
import RelatedItem from '@components/molecules/RelatedItem';
import './RelatedItems.css';

const RelatedItems = ({ items }) => {

    return (
        <div className='Related-Items-Container'>
            {items.map(({ title, icon, description, to }, index) => (
                <RelatedItem 
                    title={title} 
                    to={to}
                    description={description}
                    Icon={icon} 
                    key={index} />
            ))}
        </div>
    );
};

export default RelatedItems;