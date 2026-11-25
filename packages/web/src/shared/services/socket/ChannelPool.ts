import SocketChannel from '@/shared/services/socket/SocketChannel';
import { defineErrors } from '@/shared/errors/define-errors';
import type { PoolEntry } from '@/shared/contracts/channel';

const ChannelError = defineErrors({
    domain: 'Channel',
    causes: {
        AlreadyAcquired: 500
    }
} as const);

class ChannelPool{
    readonly #entries = new Map<string, PoolEntry>();

    acquire(path: string, isExclusive = false): SocketChannel{
        const entry = this.#entries.get(path);
        if(entry){
            if(isExclusive) throw ChannelError.AlreadyAcquired(path);

            entry.refs += 1;
            return entry.channel;
        }
        const channel = new SocketChannel(path);
        this.#entries.set(path, { channel, refs: 1 });
        return channel;
    }

    release(path: string){
        const entry = this.#entries.get(path);
        if(!entry) return;
        entry.refs -= 1;
        if(entry.refs <= 0){
            entry.channel.close();
            this.#entries.delete(path);
        }
    }

    peek(path: string): SocketChannel | undefined{
        return this.#entries.get(path)?.channel;
    }
}

export const channelPool = new ChannelPool();
