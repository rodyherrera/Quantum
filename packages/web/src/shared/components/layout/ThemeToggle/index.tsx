import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/shared/store/theme';
import { iconButtonClass } from '@/shared/components/layout/sidebar-classes';

const ThemeToggle = () => {
    const theme = useThemeStore((state) => state.theme);
    const toggle = useThemeStore((state) => state.toggle);
    const isDark = theme === 'dark';
    const label = isDark ? 'Switch to the light theme' : 'Switch to the dark theme';

    return (
        <button type='button' aria-label={label} title={label} onClick={toggle} className={iconButtonClass}>
            {isDark ? <Sun className='size-[0.9375rem]' aria-hidden='true' /> : <Moon className='size-[0.9375rem]' aria-hidden='true' />}
        </button>
    );
};

export default ThemeToggle;
