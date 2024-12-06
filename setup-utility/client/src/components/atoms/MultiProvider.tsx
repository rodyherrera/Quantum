import React, { ReactNode, ReactElement } from 'react';

interface MultiProviderProps {
    providers: ReactElement[];
    children: ReactNode;
}

/**
 * A component that wraps its children with multiple context providers.
 * 
 * @param {MultiProviderProps} props The component props.
 * @param {ReactElement[]} props.providers An array of React elements representing the providers.
 * @param {ReactNode} props.children The children that will be wrapped by the providers.
 * @returns {ReactNode} The children wrapped with the provided context providers.
 */
const MultiProvider: React.FC<MultiProviderProps> = ({ providers, children }) => {
    if(!providers || !providers.length){
        throw new Error('MultiProvider requires a non-empty "providers" array');
    }

    if(!children){
        throw new Error('MultiProvider requires "children" to wrap');
    }

    return providers.reduceRight<ReactNode>(
        (acc, provider) => React.cloneElement(provider, provider.props, acc),
        children
    );
};

export default MultiProvider;
