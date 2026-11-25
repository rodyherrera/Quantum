import { useEffect, useRef } from 'react';
import { useChannel } from '@/shared/hooks/socket/use-channel';
import { mountTerminal } from '@/shared/components/terminal/mount';
import TerminalFrame from '@/shared/components/terminal/TerminalFrame';
import type { Terminal } from '@xterm/xterm';
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

        const { term, unmount } = mountTerminal(containerRef.current, {
            convertEol: true,
            disableStdin: true,
            cursorBlink: false,
            cursorStyle: 'bar',
            scrollback: SCROLLBACK
        });
        terminalRef.current = term;

        return () => {
            terminalRef.current = null;
            unmount();
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
