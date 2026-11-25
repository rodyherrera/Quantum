import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { TERMINAL_THEME } from '@/shared/components/terminal/theme';
import type { ITerminalOptions } from '@xterm/xterm';

interface MountedTerminal{
    term: Terminal;
    unmount: () => void;
}

/*
 * Opens a terminal that fills the container and follows its size. Disposal waits one task: opening
 * queues a scroll sync that xterm never cancels, and disposing first leaves it reading a renderer
 * that is already gone, which is exactly what React's StrictMode remount does.
 */
export const mountTerminal = (container: HTMLElement, options: ITerminalOptions): MountedTerminal => {
    const term = new Terminal({ ...options, theme: TERMINAL_THEME });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(container);
    fitAddon.fit();

    const observer = new ResizeObserver(() => fitAddon.fit());
    observer.observe(container);

    return {
        term,
        unmount: () => {
            observer.disconnect();
            setTimeout(() => term.dispose());
        }
    };
};
