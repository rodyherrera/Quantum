import ReactDOM from 'react-dom/client';
import Application from '@/Application.tsx';
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            retry: 3
        }
    }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <BrowserRouter>
        <QueryClientProvider client={queryClient}>
            <Application />
        </QueryClientProvider>
    </BrowserRouter>
);