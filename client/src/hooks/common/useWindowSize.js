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

import { useState, useEffect } from 'react';

/**
 * @function useWindowSize
 * @description A React custom hook that dynamically tracks the width and height of the browser window.
 * @returns {Object} An object containing the current window dimensions:
 *   * `width`: The width of the window in pixels.
 *   * `height`: The height of the window in pixels. 
*/
const useWindowSize = () => {
    /**
     * @typedef {Object} WindowSize
     * @property {number} width - The width of the window in pixels.
     * @property {number} height - The height of the window in pixels.
    */
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    /**
     * Event handler for window resize events. Updates the windowSize state.
    */
    const handleWindowResize = () => {
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight
        });
    };

    useEffect(() => {
        // Add resize listener on component mount
        window.addEventListener('resize', handleWindowResize);
        return () => {
            // Cleanup function to remove the listener on component unmount
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    return windowSize;
};

export default useWindowSize;