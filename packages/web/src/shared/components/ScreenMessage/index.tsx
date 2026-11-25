import type { ReactNode } from 'react';

interface ScreenMessageProps{
    title: string;
    description: string;
    children?: ReactNode;
}

/* A whole-screen message: not found, server down, crashed page. */
const ScreenMessage = ({ title, description, children }: ScreenMessageProps) => (
    <main className='screen-view flex min-h-dvh items-center justify-center bg-background p-6'>
        <section className='flex w-full max-w-sm flex-col items-center text-center'>
            <h1 className='text-xl font-semibold tracking-[-0.015em] text-foreground'>{title}</h1>
            <p className='mt-2 text-muted'>{description}</p>
            {children}
        </section>
    </main>
);

export default ScreenMessage;
