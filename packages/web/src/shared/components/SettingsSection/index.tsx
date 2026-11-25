import { cn } from '@heroui/react';
import type { ReactNode } from 'react';

interface SettingsSectionProps{
    title: string;
    description?: string;
    tone?: 'default' | 'danger';
    children: ReactNode;
}

/* A titled card. Its rows are split by hairlines; free-form content goes in a SettingsBlock. */
const SettingsSection = ({ title, description, tone = 'default', children }: SettingsSectionProps) => (
    <section className='flex flex-col gap-2.5'>
        <div>
            <h2 className='text-[0.84375rem] font-semibold text-foreground'>{title}</h2>
            {description !== undefined && <p className='mt-0.5 max-w-[60ch] text-subtle'>{description}</p>}
        </div>

        <div className={cn('min-w-0 rounded-lg border bg-surface [&>*+*]:border-t [&>*+*]:border-separator', tone === 'danger' ? 'border-danger/30' : 'border-separator')}>
            {children}
        </div>
    </section>
);

export const SettingsBlock = ({ children }: { children: ReactNode }) => (
    <div className='flex min-w-0 flex-col gap-4 p-4'>{children}</div>
);

export default SettingsSection;
