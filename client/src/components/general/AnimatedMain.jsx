import React from 'react';
import { motion } from 'framer-motion';

const AnimatedMain = (props) => {
    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...props}
        />
    );
};

export default AnimatedMain;