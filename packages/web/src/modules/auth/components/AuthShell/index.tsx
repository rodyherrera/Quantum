import type { ReactNode } from 'react';

interface AuthShellProps{
    title: string;
    description?: string;
    children: ReactNode;
}

const QuantumMark = () => (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='size-6 fill-none stroke-current' strokeWidth='1.6'>
        <ellipse cx='12' cy='12' rx='10' ry='4.2' transform='rotate(32 12 12)' />
        <ellipse cx='12' cy='12' rx='10' ry='4.2' transform='rotate(-32 12 12)' />
        <circle cx='12' cy='12' r='2.1' className='fill-current stroke-none' />
    </svg>
);

const AuthShell = ({ title, description, children }: AuthShellProps) => (
    <main className='screen-view relative grid min-h-dvh place-items-center overflow-hidden bg-background px-4 pb-28 pt-16 text-foreground'>
        <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(40%_60%_at_50%_0%,color-mix(in_oklab,var(--accent)_16%,transparent),transparent)]'
        />

        <section className='relative flex w-full max-w-[21.25rem] flex-col gap-5'>
            <header className='flex flex-col items-center gap-[1.125rem] text-center'>
                <span className='grid size-11 place-items-center rounded-xl border border-border bg-surface-secondary shadow-[var(--overlay-shadow)]'>
                    <QuantumMark />
                </span>

                <div className='flex flex-col gap-1.5'>
                    <h1 className='text-[1.3125rem] font-semibold tracking-[-0.02em] text-foreground'>{title}</h1>
                    {description !== undefined && <p className='text-muted'>{description}</p>}
                </div>
            </header>

            {children}
        </section>
    </main>
);

export default AuthShell;
