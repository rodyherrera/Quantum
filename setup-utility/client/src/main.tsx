import ReactDOM from 'react-dom/client';
import Application from '@/Application.tsx';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <BrowserRouter>
        <Application />
    </BrowserRouter>
);