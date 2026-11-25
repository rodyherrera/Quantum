import { Button } from '@heroui/react';

interface ErrorStateProps{
    title: string;
    description: string;
    onRetry: () => void;
}

const ErrorState = ({ title, description, onRetry }: ErrorStateProps) => (
    <section className='flex w-full max-w-md flex-col items-start gap-4 rounded-lg border border-separator bg-surface p-5'>
        <div className='flex flex-col gap-1'>
            <h2 className='text-sm font-semibold text-danger'>{title}</h2>
            <p className='text-muted'>{description}</p>
        </div>

        <Button size='sm' variant='secondary' onPress={onRetry}>Try again</Button>
    </section>
);

export default ErrorState;
