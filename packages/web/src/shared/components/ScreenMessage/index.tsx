import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface ScreenMessageProps{
    icon: LucideIcon;
    title: string;
    description: string;
    children?: ReactNode;
}

/* A whole-screen message: not found, server down, crashed page. */
const ScreenMessage = ({ icon: Icon, title, description, children }: ScreenMessageProps) => (
    <main className='screen-view flex min-h-dvh items-center justify-center bg-background p-6'>
        <section className='flex w-full max-w-sm flex-col items-center text-center'>
            <span aria-hidden='true' className='grid size-10 place-items-center rounded-xl border border-border bg-surface-secondary text-muted'>
                <Icon className='size-[1.125rem]' />
            </span>
            <h1 className='mt-5 text-xl font-semibold tracking-[-0.015em] text-foreground'>{title}</h1>
            <p className='mt-2 text-muted'>{description}</p>
            {children}
        </section>
    </main>
);

export default ScreenMessage;
