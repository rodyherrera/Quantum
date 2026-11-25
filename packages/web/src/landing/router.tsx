import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazyElement } from '@/app/lazy-element';
import { withViewTransitions } from '@/app/with-view-transitions';
import RouteErrorBoundary from '@/shared/components/routing/RouteErrorBoundary';

/* The public site, built and hosted apart from the dashboard: a self-hosted Quantum never ships it. */
export const router = withViewTransitions(createBrowserRouter([{
    element: <RouteErrorBoundary />,
    children: [
        { index: true, element: lazyElement(() => import('@/landing/pages/Landing')) },
        { path: 'get-started', element: lazyElement(() => import('@/landing/pages/GetStarted')) },
        { path: '*', element: <Navigate to='/' replace /> }
    ]
}]));
