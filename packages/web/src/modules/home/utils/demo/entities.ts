import type { BaseEntity } from '@quantum/contracts/shared/base';
import type { ContainerAddress } from '@quantum/contracts/modules/docker/domain';

const MINUTE_MS = 60_000;

export const DEMO_ORGANIZATION = 'Acme';

export const DEMO_USER = { username: 'you', fullname: 'You' };

export const DEMO_HOST = '203.0.113.24';

export const minutesAgo = (minutes: number): string => new Date(Date.now() - minutes * MINUTE_MS).toISOString();

export const entity = (id: number, minutes: number): BaseEntity => ({ id, createdAt: minutesAgo(minutes), updatedAt: minutesAgo(minutes) });

export const address = (ip: string, hostname: string): ContainerAddress => ({ ip, hostname });
