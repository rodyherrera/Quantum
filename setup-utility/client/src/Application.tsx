import { Routes, Route } from 'react-router-dom';
import pages from '@pages';
import Layout from '@components/organisms/Layout';
import '@styles/global.css';

const Application = () => {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path='/' element={<pages.Setup />} />
            </Route>
        </Routes>
    );
};

export default Application;