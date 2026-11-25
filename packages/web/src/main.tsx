import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import '@/assets/styles/index.css';
import { initTheme } from '@/shared/utils/theme';
import ErrorBoundary from '@/shared/components/ErrorBoundary';

initTheme();

// The dashboard and the public landing share one entry; `--mode landing` builds the landing alone.
const { router } = import.meta.env.MODE === 'landing'
    ? await import('@/landing/router')
    : await import('@/app/router');

const rootElement = document.getElementById('root');
if(rootElement === null) throw new Error('Root element not found');

createRoot(rootElement).render(
    <StrictMode>
        <ErrorBoundary>
            <RouterProvider router={router} />
        </ErrorBoundary>
    </StrictMode>
);
