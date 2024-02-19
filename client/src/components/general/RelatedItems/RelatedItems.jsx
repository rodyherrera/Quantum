import React from 'react';
import RelatedItem from '@components/general/RelatedItem';
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