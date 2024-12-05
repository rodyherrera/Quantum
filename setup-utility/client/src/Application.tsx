import { Routes, Route } from 'react-router-dom';
import pages from '@pages';
import '@styles/global.css';

const Application = () => {
    return (
        <Routes>
            <Route path='/' element={<pages.Setup />} />
        </Routes>
    );
};

export default Application;