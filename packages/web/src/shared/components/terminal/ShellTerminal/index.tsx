import { useEffect, useRef, useState } from 'react';
import { useChannel } from '@/shared/hooks/socket/use-channel';
import { mountTerminal } from '@/shared/components/terminal/mount';
import TerminalFrame from '@/shared/components/terminal/TerminalFrame';
import type { Terminal } from '@xterm/xterm';
import type { ReactNode } from 'react';
import type { ChannelApi, ChannelStatus } from '@/shared/contracts/channel';
import type { TerminalExit } from '@quantum/contracts/modules/repository/gateway';

const CONNECTION_LABEL: Partial<Record<ChannelStatus, string>> = {
    connecting: 'Connecting to shell…',
    reconnecting: 'Connection lost — reconnecting…'
};

const exitBanner = (code: number): string => `\r\n\x1b[31mProcess exited with code ${code}\x1b[0m\r\n`;

interface ShellTerminalProps{
    channelPath: string;
    joinPayload?: object;
    title?: string;
    description: string;
    actions?: ReactNode;
}

const ShellTerminal = ({ channelPath, joinPayload = {}, title = 'Shell', description, actions }: ShellTerminalProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const terminalRef = useRef<Terminal | null>(null);
    const joinedRef = useRef(false);

    const [joined, setJoined] = useState(false);

    const channel = useChannel(channelPath, {
        'terminal.join': () => {
            joinedRef.current = true;
            setJoined(true);
        },
        'terminal.output': (data) => terminalRef.current?.write(data as string),
        'terminal.exit': (data) => {
            const { code } = data as TerminalExit;
            const term = terminalRef.current;
            if(!term) return;
            term.options.disableStdin = true;
            term.write(exitBanner(code));
        }
    });

    const channelRef = useRef<ChannelApi>(channel);
    useEffect(() => {
        channelRef.current = channel;
    });

    const { status, send } = channel;
    const payloadJson = JSON.stringify(joinPayload);

    useEffect(() => {
        if(status !== 'open'){
            joinedRef.current = false;
            setJoined(false);
            return;
        }

        send('terminal.join', JSON.parse(payloadJson) as object);
    }, [status, send, payloadJson]);

    useEffect(() => {
        const term = terminalRef.current;
        if(!joined || !term) return;

        send('terminal.resize', { cols: term.cols, rows: term.rows });
    }, [joined, send]);

    useEffect(() => {
        if(!containerRef.current) return;

        const { term, unmount } = mountTerminal(containerRef.current, { cursorBlink: true, convertEol: true });
        terminalRef.current = term;

        const offData = term.onData((data) => {
            if(!joinedRef.current) return;
            channelRef.current.send('terminal.input', data);
        });

        const offResize = term.onResize(({ cols, rows }) => {
            if(!joinedRef.current) return;
            channelRef.current.send('terminal.resize', { cols, rows });
        });

        return () => {
            offData.dispose();
            offResize.dispose();
            terminalRef.current = null;
            unmount();
        };
    }, []);

    return (
        <TerminalFrame
            title={title}
            description={description}
            connection={channel.status === 'open' ? undefined : CONNECTION_LABEL[channel.status]}
            actions={actions}
            error={channel.lastError ?? null}
            onDismissError={channel.clearError}
            containerRef={containerRef}
        />
    );
};

export default ShellTerminal;
