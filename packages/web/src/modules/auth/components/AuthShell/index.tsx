import type { ReactNode } from 'react';

interface AuthShellProps{
    title: string;
    description?: string;
    children: ReactNode;
}

const AuthShell = ({ title, description, children }: AuthShellProps) => (
    <main className='screen-view grid min-h-dvh place-items-center bg-background px-4 pb-28 pt-16 text-foreground'>
        <section className='flex w-full max-w-[21.25rem] flex-col gap-5'>
            <header className='flex flex-col items-center gap-1.5 text-center'>
                <h1 className='text-[1.3125rem] font-semibold tracking-[-0.02em] text-foreground'>{title}</h1>
                {description !== undefined && <p className='text-muted'>{description}</p>}
            </header>

            {children}
        </section>
    </main>
);

export default AuthShell;
