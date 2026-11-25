import { useEffect, useRef, useSyncExternalStore } from 'react';
import { toError } from '@/shared/utils/errors';

export type QueryKey = readonly unknown[];

export interface QuerySnapshot{
    data: unknown;
    loading: boolean;
    refreshing: boolean;
    error: Error | undefined;
    status: 'pending' | 'success' | 'error';
}

type Listener = () => void;

const IDLE: QuerySnapshot = Object.freeze({ data: null, loading: false, refreshing: false, error: undefined, status: 'pending' });
const PENDING: QuerySnapshot = Object.freeze({ data: null, loading: true, refreshing: false, error: undefined, status: 'pending' });

const keyOf = (key: QueryKey): string => JSON.stringify(key);

const inFlight = (current: QuerySnapshot | undefined): QuerySnapshot => {
    const held = current !== undefined && current.data !== null;
    return { ...(current ?? PENDING), loading: !held, refreshing: held, status: 'pending' };
};

class QueryCache{
    readonly #entries = new Map<string, QuerySnapshot>();
    readonly #listeners = new Map<string, Set<Listener>>();
    readonly #loaders: Map<string, Set<(force?: boolean) => Promise<unknown>>> = new Map();
    readonly #flights = new Map<string, Promise<void>>();

    snapshot(key: QueryKey): QuerySnapshot{
        return this.#entries.get(keyOf(key)) ?? PENDING;
    }

    subscribe(key: QueryKey, listener: Listener): () => void{
        const id = keyOf(key);
        const listeners = this.#listeners.get(id) ?? new Set<Listener>();
        this.#listeners.set(id, listeners);
        listeners.add(listener);

        return () => {
            listeners.delete(listener);
            if(listeners.size === 0) this.#listeners.delete(id);
        };
    }

    registerLoader(key: QueryKey, loader: (force?: boolean) => Promise<unknown>): () => void{
        const id = keyOf(key);
        const loaders = this.#loaders.get(id) ?? new Set();
        this.#loaders.set(id, loaders);
        loaders.add(loader);

        return () => {
            loaders.delete(loader);
            if(loaders.size === 0) this.#loaders.delete(id);
        };
    }

    hasLoader(key: QueryKey): boolean{
        const loaders = this.#loaders.get(keyOf(key));
        return loaders !== undefined && loaders.size > 0;
    }

    async load(key: QueryKey, force = false): Promise<boolean>{
        const id = keyOf(key);
        const existing = this.#flights.get(id);
        if(existing){
            await existing;
            return false;
        }

        const loaders = this.#loaders.get(id);
        if(loaders === undefined || loaders.size === 0) return false;

        const flight = (async () => {
            const current = this.#entries.get(id);
            this.#write(id, inFlight(current));

            try{
                const data = await [...loaders][0]!(force);
                this.#write(id, { data, loading: false, refreshing: false, error: undefined, status: 'success' });
            }catch(cause){
                this.#write(id, { data: null, loading: false, refreshing: false, error: toError(cause), status: 'error' });
            }
        })();

        this.#flights.set(id, flight);
        try{
            await flight;
        }finally{
            this.#flights.delete(id);
        }

        return true;
    }

    patch(key: QueryKey, updater: (data: unknown) => unknown): () => void{
        const id = keyOf(key);
        const current = this.#entries.get(id);
        if(current === undefined || current.status !== 'success') return () => {};

        this.#write(id, { ...current, data: updater(current.data) });
        return () => {
            const now = this.#entries.get(id);
            if(now?.status === 'success') this.#write(id, current);
        };
    }

    async refresh(keys: QueryKey[]): Promise<void>{
        if(keys.length === 0) return;

        for(const key of keys){
            const id = keyOf(key);
            const entry = this.#entries.get(id);
            if(entry !== undefined && entry.status !== 'pending' && this.hasLoader(key)) this.#write(id, inFlight(entry));
        }

        await Promise.all(keys.map(async (key) => {
            if(!(await this.load(key, true))) await this.load(key, true);
        }));
    }

    async invalidateSegment(segment: string): Promise<void>{
        const keys: QueryKey[] = [];
        for(const id of this.#entries.keys()){
            if(this.#flights.has(id)) continue;

            const parsed: unknown = JSON.parse(id);
            if(Array.isArray(parsed) && parsed[0] === segment) keys.push(parsed as QueryKey);
        }

        await this.refresh(keys);
    }

    #write(id: string, snapshot: QuerySnapshot): void{
        this.#entries.set(id, Object.freeze(snapshot));
        for(const listener of this.#listeners.get(id) ?? []) listener();
    }

    reset(): void{
        this.#entries.clear();
        this.#loaders.clear();
        this.#listeners.clear();
        this.#flights.clear();
    }
}

export const queryCache = new QueryCache();

export const useQueryStore = (key: QueryKey | null): QuerySnapshot =>
    useSyncExternalStore(
        (listener) => (key === null ? () => {} : queryCache.subscribe(key, listener)),
        () => (key === null ? IDLE : queryCache.snapshot(key))
    );

export const useRegisteredLoader = (key: QueryKey | null, request: ((force?: boolean) => Promise<unknown>) | null): void => {
    const latest = useRef<((force?: boolean) => Promise<unknown>) | null>(request);
    useEffect(() => {
        latest.current = request;
    });

    const keyJson = key === null ? null : keyOf(key);
    useEffect(() => {
        if(keyJson === null) return;
        const parsed = JSON.parse(keyJson) as QueryKey;

        return queryCache.registerLoader(parsed, (force) => {
            const current = latest.current;
            if(current === null) return Promise.resolve(undefined);
            return current(force);
        });
    }, [keyJson]);
};