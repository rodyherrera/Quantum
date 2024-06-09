import React from 'react';

/**
 * A component that wraps its children with multiple context providers.
 * 
 * @param {Object} props The component props.
 * @param {Array} props.providers An array of React elements representing the providers.
 * @param {React.ReactNode} props.children The children that will be wrapped by the providers.
 * @returns {React.ReactNode} The children wrapped with the provided context providers.
 * 
*/
const MultiProvider = ({ providers, children }) => {
    if(!providers || !providers.length){
        throw new Error('MultiProvider requires a non-empty "providers" array');
    }
    if(!children){
        throw new Error('MultiProvider requires "children" to wrap');
    }
    // Wrap the children with each provider, starting from the last to the first.
    // This uses Array.reduceRight to iterate over the providers in reverse order,
    // ensuring the correct nesting of providers around the children.
    return providers.reduceRight((acc, provider) => 
        React.cloneElement(provider, provider.props, acc),
        children
    );
};

export default MultiProvider;