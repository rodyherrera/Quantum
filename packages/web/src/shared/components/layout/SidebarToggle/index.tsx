import { PanelLeft } from 'lucide-react';
import { useSidebarStore } from '@/shared/store/sidebar';
import { iconButtonClass } from '@/shared/components/layout/sidebar-classes';

const SidebarToggle = () => {
    const collapsed = useSidebarStore((state) => state.collapsed);
    const toggle = useSidebarStore((state) => state.toggle);

    return (
        <button
            type='button'
            aria-label={collapsed ? 'Show navigation labels' : 'Collapse navigation'}
            aria-expanded={!collapsed}
            onClick={toggle}
            className={`${iconButtonClass} hidden lg:inline-flex`}
        >
            <PanelLeft className='size-[0.9375rem]' aria-hidden='true' />
        </button>
    );
};

export default SidebarToggle;
