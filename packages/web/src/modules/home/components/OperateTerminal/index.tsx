import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { TERMINAL_THEME } from '@/shared/components/terminal/theme';
import { useInView } from '@/modules/home/hooks/use-in-view';
import { useReducedMotion } from '@/modules/home/hooks/use-reduced-motion';
import { LOG_PRELUDE, LOG_REQUESTS, SHELL_PROMPT, SHELL_SESSION } from '@/modules/home/utils/demo/terminal';

type Stream = 'logs' | 'shell';

const STREAMS: { id: Stream; label: string }[] = [
    { id: 'logs', label: 'Logs' },
    { id: 'shell', label: 'Shell' }
];

const STATUSES = [200, 200, 200, 201, 200, 304, 200, 200];

const TYPE_MS = 55;

const tabClass = (active: boolean): string =>
    `label-caps -mb-px border-b pb-3.5 transition-colors motion-reduce:transition-none ${
        active ? 'border-foreground text-foreground' : 'border-transparent text-muted hover:text-foreground'
    }`;

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

const requestLine = (): string => {
    const status = pick(STATUSES);
    const ms = String(4 + Math.round(Math.random() * (status === 201 ? 160 : 60))).padStart(4);
    return `${pick(LOG_REQUESTS).padEnd(30)}${status}  ${ms} ms`;
};

const pause = (ms: number, signal: AbortSignal): Promise<void> => new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => clearTimeout(timer), { once: true });
});

const playLogs = async (term: Terminal, signal: AbortSignal) => {
    for(const line of LOG_PRELUDE) term.writeln(line);

    while(!signal.aborted){
        await pause(650 + Math.random() * 900, signal);
        if(!signal.aborted) term.writeln(requestLine());
    }
};

const playShell = async (term: Terminal, signal: AbortSignal) => {
    while(!signal.aborted){
        term.clear();

        for(const exchange of SHELL_SESSION){
            term.write(SHELL_PROMPT);
            await pause(700, signal);

            for(const character of exchange.command){
                if(signal.aborted) return;
                term.write(character);
                await pause(TYPE_MS, signal);
            }

            term.write('\r\n');
            for(const line of exchange.output) term.writeln(line);
            await pause(900, signal);
        }

        term.write(SHELL_PROMPT);
        await pause(4_000, signal);
    }
};

const writeStill = (term: Terminal, stream: Stream) => {
    if(stream === 'logs'){
        for(const line of LOG_PRELUDE) term.writeln(line);
        for(const path of LOG_REQUESTS.slice(0, 4)) term.writeln(`${path.padEnd(30)}200    18 ms`);
        return;
    }

    for(const exchange of SHELL_SESSION){
        term.writeln(`${SHELL_PROMPT}${exchange.command}`);
        for(const line of exchange.output) term.writeln(line);
    }
    term.write(SHELL_PROMPT);
};

const OperateTerminal = () => {
    const frame = useRef<HTMLDivElement>(null);
    const screen = useRef<HTMLDivElement>(null);
    const terminal = useRef<Terminal | null>(null);
    const isVisible = useInView(frame);
    const isReduced = useReducedMotion();
    const [stream, setStream] = useState<Stream>('logs');
    const [isReady, setReady] = useState(false);

    useEffect(() => {
        const node = screen.current;
        if(node === null) return;

        const term = new Terminal({
            convertEol: true,
            disableStdin: true,
            cursorBlink: false,
            cursorStyle: 'bar',
            fontSize: 12,
            scrollback: 500,
            theme: TERMINAL_THEME
        });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(node);
        fitAddon.fit();
        terminal.current = term;
        setReady(true);

        const watcher = new ResizeObserver(() => fitAddon.fit());
        watcher.observe(node);

        return () => {
            watcher.disconnect();
            term.dispose();
            terminal.current = null;
            setReady(false);
        };
    }, []);

    useEffect(() => {
        const term = terminal.current;
        if(term === null || !isReady) return;

        term.reset();

        if(isReduced || !isVisible){
            writeStill(term, stream);
            return;
        }

        const controller = new AbortController();
        void (stream === 'logs' ? playLogs : playShell)(term, controller.signal);
        return () => controller.abort();
    }, [isReady, isReduced, isVisible, stream]);

    return (
        <div ref={frame} className='flex min-h-0 flex-1 flex-col'>
            <div className='flex items-end justify-between gap-4 border-b border-border'>
                <div role='group' aria-label='Terminal' className='flex gap-8'>
                    {STREAMS.map((entry) => (
                        <button key={entry.id} type='button' aria-pressed={entry.id === stream} onClick={() => setStream(entry.id)} className={tabClass(entry.id === stream)}>
                            {entry.label}
                        </button>
                    ))}
                </div>

                <span className='pb-3.5 text-[0.8125rem] text-muted'>
                    {stream === 'logs' ? 'Output of the storefront container.' : 'Shell into storefront.'}
                </span>
            </div>

            <div className='mt-6 flex h-[22rem] flex-col border border-border'>
                <div ref={screen} aria-hidden='true' className='min-h-0 flex-1 overflow-hidden bg-black p-2' />
            </div>
        </div>
    );
};

export default OperateTerminal;
