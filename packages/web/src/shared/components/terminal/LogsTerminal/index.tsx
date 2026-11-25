import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { useChannel } from '@/shared/hooks/socket/use-channel';
import { TERMINAL_THEME } from '@/shared/components/terminal/theme';
import TerminalFrame from '@/shared/components/terminal/TerminalFrame';
import type { ReactNode } from 'react';
import type { ChannelStatus } from '@/shared/contracts/channel';

const SCROLLBACK = 5_000;

const CONNECTION_LABEL: Partial<Record<ChannelStatus, string>> = {
    connecting: 'Attaching…',
    reconnecting: 'Connection lost — reattaching…'
};

interface LogsTerminalProps{
    channelPath: string;
    subscribePayload?: object;
    title?: string;
    description: string;
    actions?: ReactNode;
}

const LogsTerminal = ({ channelPath, subscribePayload = {}, title = 'Logs', description, actions }: LogsTerminalProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const terminalRef = useRef<Terminal | null>(null);

    const channel = useChannel(channelPath, {
        'logs.line': (data) => {
            const { line } = data as { line: string };
            terminalRef.current?.writeln(line);
        }
    });

    const { status, send } = channel;
    const payloadJson = JSON.stringify(subscribePayload);

    useEffect(() => {
        if(status !== 'open') return;
        terminalRef.current?.clear();
        send('logs.subscribe', JSON.parse(payloadJson) as object);
    }, [status, send, payloadJson]);

    useEffect(() => {
        if(!containerRef.current) return;

        const term = new Terminal({
            convertEol: true,
            disableStdin: true,
            cursorBlink: false,
            cursorStyle: 'bar',
            scrollback: SCROLLBACK,
            theme: TERMINAL_THEME
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(containerRef.current);
        fitAddon.fit();
        terminalRef.current = term;

        const observer = new ResizeObserver(() => fitAddon.fit());
        observer.observe(containerRef.current);

        return () => {
            observer.disconnect();
            term.dispose();
            terminalRef.current = null;
        };
    }, []);

    return (
        <TerminalFrame
            title={title}
            description={description}
            connection={status === 'open' ? undefined : CONNECTION_LABEL[status]}
            actions={actions}
            error={channel.lastError ?? null}
            onDismissError={channel.clearError}
            containerRef={containerRef}
        />
    );
};

export default LogsTerminal;
