import type { ReactNode } from 'react';

interface SettingsRowProps{
    title: ReactNode;
    description?: string;
    action?: ReactNode;
    children?: ReactNode;
}

const SettingsRow = ({ title, description, action, children }: SettingsRowProps) => (
    <div className='px-4 py-3'>
        <div className='flex min-h-8 flex-wrap items-center justify-between gap-x-4 gap-y-2'>
            <div className='flex min-w-0 flex-1 basis-56 flex-col gap-0.5'>
                <span className='font-medium text-foreground'>{title}</span>
                {description !== undefined && <span className='text-subtle'>{description}</span>}
            </div>

            {action !== undefined && <div className='flex shrink-0 items-center gap-2'>{action}</div>}
        </div>

        {children !== undefined && <div className='mt-3'>{children}</div>}
    </div>
);

export default SettingsRow;
