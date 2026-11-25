import type { ReactNode } from 'react';

interface DetailViewProps{
    header: ReactNode;
    tabs?: ReactNode;
    rail: ReactNode;
    children: ReactNode;
}

/* An entity page: header, tabs and the tab's content on the left, its properties on the right. */
const DetailView = ({ header, tabs, rail, children }: DetailViewProps) => (
    <div className='grid min-h-0 flex-1 xl:grid-cols-[minmax(0,1fr)_18.75rem]'>
        <div className='flex min-w-0 flex-col xl:overflow-y-auto'>
            {header}
            {tabs}
            <div className='flex min-h-0 flex-1 flex-col'>{children}</div>
        </div>

        <aside aria-label='Properties' className='min-w-0 border-t border-separator px-5 pb-10 xl:overflow-y-auto xl:border-l xl:border-t-0 xl:px-4'>
            {rail}
        </aside>
    </div>
);

export default DetailView;
