import type { StackDeployTrigger } from '@quantum/contracts/modules/template/domain';

export const DEPLOY_TRIGGERS: StackDeployTrigger[] = ['push', 'release'];

export const deployTriggerLabel = (trigger: StackDeployTrigger, branch: string): string =>
    trigger === 'push' ? `Every push to ${branch}` : 'Every published release';
