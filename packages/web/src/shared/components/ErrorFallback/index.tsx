import { Button } from '@heroui/react';
import ScreenMessage from '@/shared/components/ScreenMessage';
import type { ErrorFallbackProps } from '@/shared/contracts/boundary';

const ErrorFallback = ({ error, reset }: ErrorFallbackProps) => (
    <ScreenMessage
        title='Something went wrong'
        description='An unexpected error interrupted this page. Try again, or reload if it keeps happening.'
    >
        {import.meta.env.DEV && (
            <pre className='mt-6 max-h-64 w-full overflow-auto rounded-lg border border-separator bg-surface p-3 text-left font-mono text-xs text-muted'>
                {error.message}
                {error.stack ? `\n\n${error.stack}` : ''}
            </pre>
        )}

        <div className='mt-6 flex gap-2'>
            <Button onPress={reset}>Try again</Button>
            <Button variant='secondary' onPress={() => window.location.reload()}>Reload</Button>
        </div>
    </ScreenMessage>
);

export default ErrorFallback;
