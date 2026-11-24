import { useQuery } from '@/shared/hooks/api/use-query';
import { serverApi } from '@/shared/api/server-api';

const fallbackHost = (): string => (typeof window === 'undefined' ? 'localhost' : window.location.hostname);

export const usePublicHost = (): string => {
    const address = useQuery(serverApi.publicAddress, []);
    return address.data?.host ?? fallbackHost();
};

export const portUrl = (host: string, externalPort: number): string => `http://${host}:${externalPort}`;
