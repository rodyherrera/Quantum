import React from 'react';
import './PolicyArticle.css';

const PolicyArticle = ({ content, title = null }) => {

    return (
        <div className='Privacy-Policy-Article-Container'>
            <p className='Privacy-Policy-Article'>
                {title && (
                    <b className='Privacy-Policy-Article-Title'>{title}:</b>
                )}
                <span className='Privacy-Policy-Article-Content'>{content}</span>
            </p>
        </div>
    );
};

export default PolicyArticle;