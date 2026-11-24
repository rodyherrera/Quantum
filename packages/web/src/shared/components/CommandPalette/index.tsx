import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AutocompleteFilter,
    Header,
    Input,
    ListBox,
    ListBoxItem,
    ModalBackdrop,
    ModalContainer,
    ModalDialog,
    TextField,
    useFilter
} from '@heroui/react';
import { GitBranch, Layers, LayoutTemplate, SunMoon } from 'lucide-react';
import { navGroups, settingsGroups } from '@/app/navigation/sections';
import { usePaletteStore } from '@/shared/store/palette';
import { useThemeStore } from '@/shared/store/theme';
import type { LucideIcon } from 'lucide-react';

interface Command{
    id: string;
    label: string;
    icon: LucideIcon;
    run: () => void;
}

interface CommandSection{
    heading: string;
    commands: Command[];
}

const isToggleShortcut = (event: KeyboardEvent): boolean =>
    (event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k';

/* ⌘K: jump to any page, start a deploy, or flip the theme, without leaving the keyboard. */
const CommandPalette = () => {
    const open = usePaletteStore((state) => state.open);
    const setOpen = usePaletteStore((state) => state.setOpen);
    const toggleTheme = useThemeStore((state) => state.toggle);
    const navigate = useNavigate();
    const { contains } = useFilter({ sensitivity: 'base' });

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if(!isToggleShortcut(event)) return;
            event.preventDefault();
            setOpen(!usePaletteStore.getState().open);
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [setOpen]);

    const go = (to: string) => () => navigate(to);

    const sections: CommandSection[] = [
        {
            heading: 'Go to',
            commands: [...navGroups, ...settingsGroups.slice(1)]
                .flatMap((group) => group.items)
                .map((item) => ({ id: item.to, label: item.label, icon: item.icon, run: go(item.to) }))
        },
        {
            heading: 'Create',
            commands: [
                { id: 'import-repository', label: 'Import a repository', icon: GitBranch, run: go('/repositories/create') },
                { id: 'deploy-stack', label: 'Deploy a stack', icon: Layers, run: go('/compose/create') },
                { id: 'install-template', label: 'Install a template', icon: LayoutTemplate, run: go('/templates') }
            ]
        },
        {
            heading: 'Preferences',
            commands: [{ id: 'toggle-theme', label: 'Switch between light and dark', icon: SunMoon, run: toggleTheme }]
        }
    ];

    const byId = new Map(sections.flatMap((section) => section.commands).map((command) => [command.id, command]));

    const run = (id: string) => {
        setOpen(false);
        byId.get(id)?.run();
    };

    return (
        <ModalBackdrop isOpen={open} onOpenChange={setOpen}>
            <ModalContainer placement='top' className='pt-[12vh]'>
                <ModalDialog aria-label='Search and jump to' className='w-[min(40rem,calc(100vw-2rem))] max-w-none overflow-hidden p-0'>
                    <AutocompleteFilter filter={contains}>
                        <TextField aria-label='Search' autoFocus fullWidth className='border-b border-separator'>
                            <Input
                                placeholder='Go to a page or run an action…'
                                className='h-12 rounded-none border-0 bg-transparent px-4 text-[0.9375rem] shadow-none focus:shadow-none'
                            />
                        </TextField>

                        <ListBox
                            aria-label='Commands'
                            onAction={(key) => run(String(key))}
                            renderEmptyState={() => <p className='px-3 py-6 text-center text-subtle'>Nothing matches</p>}
                            className='max-h-[min(56vh,28rem)] overflow-y-auto p-1.5'
                        >
                            {sections.map((section) => (
                                <ListBox.Section key={section.heading}>
                                    <Header className='px-2.5 pb-1 pt-2 text-xs font-medium text-subtle'>{section.heading}</Header>
                                    {section.commands.map(({ id, label, icon: Icon }) => (
                                        <ListBoxItem key={id} id={id} textValue={label} className='gap-2.5'>
                                            <Icon aria-hidden='true' className='size-4 shrink-0 text-subtle' />
                                            {label}
                                        </ListBoxItem>
                                    ))}
                                </ListBox.Section>
                            ))}
                        </ListBox>
                    </AutocompleteFilter>

                    <footer className='flex flex-wrap gap-4 border-t border-separator px-4 py-2 text-xs text-subtle'>
                        <span>↑ ↓ to move</span>
                        <span>↵ to open</span>
                        <span>esc to close</span>
                    </footer>
                </ModalDialog>
            </ModalContainer>
        </ModalBackdrop>
    );
};

export default CommandPalette;
