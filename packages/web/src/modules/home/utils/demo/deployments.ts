import { entity } from '@/modules/home/utils/demo/entities';
import { DeploymentStatus } from '@quantum/contracts/modules/deployment/domain';
import type { Deployment } from '@quantum/contracts/modules/deployment/domain';

interface DeploymentSeed{
    id: number;
    status: DeploymentStatus;
    message: string;
    minutes: number;
}

const deployment = ({ id, status, message, minutes }: DeploymentSeed): Deployment => ({
    ...entity(id, minutes),
    repositoryId: 12,
    userId: 1,
    organizationId: 1,
    githubDeploymentId: null,
    status,
    error: null,
    commit: { message, author: { name: 'Acme', email: 'dev@acme.dev' }, date: entity(id, minutes).createdAt },
    artifact: status === DeploymentStatus.Building ? null : { image: 'quantum-repo-12', tag: `quantum-repo-12:${id.toString(16)}e4c1a`, digest: '', builder: 'dockerfile', sizeBytes: 182_452_224 },
    url: status === DeploymentStatus.Building ? null : 'http://203.0.113.24:20001',
    environmentVariables: {}
});

export const demoDeployments = (isDone: boolean): Deployment[] => [
    deployment({ id: 41, status: isDone ? DeploymentStatus.Success : DeploymentStatus.Building, message: 'feat(checkout): pay with saved cards', minutes: 0 }),
    deployment({ id: 40, status: DeploymentStatus.Success, message: 'fix(cart): keep quantities after sign in', minutes: 95 }),
    deployment({ id: 39, status: DeploymentStatus.Rolledback, message: 'perf(catalog): stream product images', minutes: 1_440 }),
    deployment({ id: 38, status: DeploymentStatus.Success, message: 'feat(search): filter by size and colour', minutes: 2_910 })
];

export const DEMO_BUILD_LOGS = [
    '[build] Strategy resolved to "dockerfile"',
    '#8 [deps 2/3] RUN npm ci --omit=dev',
    '#11 [build 4/5] RUN npm run build',
    '#11 ✓ Compiled successfully in 31.8s',
    '#14 exporting to image',
    '[build] Artifact recorded (builder=dockerfile, tag=quantum-repo-12:29e4c1a)'
];
