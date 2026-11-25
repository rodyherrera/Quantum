import { Button } from '@heroui/react';
import { TriangleAlert } from 'lucide-react';

interface ErrorStateProps{
    title: string;
    description: string;
    onRetry: () => void;
}

const ErrorState = ({ title, description, onRetry }: ErrorStateProps) => (
    <section className='flex w-full max-w-md flex-col items-start gap-4 rounded-lg border border-separator bg-surface p-5'>
        <div className='flex gap-3'>
            <TriangleAlert aria-hidden='true' className='mt-0.5 size-4 shrink-0 text-danger' />
            <div className='flex flex-col gap-1'>
                <h2 className='text-sm font-semibold text-foreground'>{title}</h2>
                <p className='text-muted'>{description}</p>
            </div>
        </div>

        <Button size='sm' variant='secondary' onPress={onRetry}>Try again</Button>
    </section>
);

export default ErrorState;
