import type Dockerode from 'dockerode';
import { getDockerHost } from './DockerHost';
import { joinOrganizationNetwork } from './NetworkOps';
import { pullImage } from './pullImage';
import DockerNetwork from '@/modules/docker/models/DockerNetwork';
import PortBinding from '@/modules/docker/models/PortBinding';
import { internalHostname } from '@/modules/docker/services/containerAddress';
import { PortBindingProtocol } from '@quantum/contracts/modules/docker/domain';
import type DockerContainer from '@/modules/docker/models/DockerContainer';

/*
 * A small nginx in front of a repository app. It holds the app's published ports and its hostname on
 * the organization network, and passes each connection to whichever container carries the app's name.
 * A release can then start next to the running app and take over while the port and the hostname
 * never go away.
 */

const EDGE_IMAGE = 'nginx:1.31.10-alpine';
const RELOAD_SETTLE_MS = 1_000;
const BOOT = 'printf "%s" "$EDGE_CONFIG" > /etc/nginx/nginx.conf && exec nginx -g "daemon off;"';
const RELOAD = 'printf "%s" "$1" > /etc/nginx/nginx.conf && nginx -t -q && nginx -s reload';

type Binding = Pick<PortBinding, 'internalPort' | 'externalPort' | 'protocol'>;

export const edgeName = (container: Pick<DockerContainer, 'dockerContainerName'>): string =>
    `${container.dockerContainerName}-edge`;

/*
 * `upstream` is the app's container name, resolved again every few seconds so a restart that moves it
 * to another address is followed, or a fixed address while a release swaps names underneath it.
 */
export const edgeConfig = (upstream: string, bindings: Binding[]): string => [
    'worker_processes 1;',
    'worker_shutdown_timeout 30s;',
    'events {}',
    'stream {',
    '    resolver 127.0.0.11 valid=5s ipv6=off;',
    ...bindings.map(({ internalPort, protocol }) => {
        const listen = protocol === PortBindingProtocol.Udp ? `${internalPort} udp` : `${internalPort}`;
        return `    server { listen ${listen}; set $app ${upstream}; proxy_pass $app:${internalPort}; }`;
    }),
    '}',
    ''
].join('\n');

export const hostPortsOf = (info: Dockerode.ContainerInspectInfo): Set<number> => {
    const ports = new Set<number>();
    for(const hostPorts of Object.values(info.HostConfig?.PortBindings ?? {})){
        for(const { HostPort } of (hostPorts ?? []) as Array<{ HostPort?: string }>){
            const port = Number(HostPort);
            if(Number.isInteger(port) && port > 0) ports.add(port);
        }
    }
    return ports;
};

const docker = (): Dockerode => getDockerHost().client();

const inspect = (name: string): Promise<Dockerode.ContainerInspectInfo | null> =>
    docker().getContainer(name).inspect().catch((error: { statusCode?: number }) =>
        error.statusCode === 404 ? null : Promise.reject(error));

const remove = (name: string): Promise<void> =>
    docker().getContainer(name).remove({ force: true }).catch((error: { statusCode?: number }) =>
        error.statusCode === 404 ? undefined : Promise.reject(error));

const exitCodeOf = async (name: string, cmd: string[]): Promise<number> => {
    const exec = await docker().getContainer(name).exec({ Cmd: cmd, AttachStdout: true, AttachStderr: true });
    const stream = await exec.start({});
    await new Promise<void>((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
        stream.resume();
    });
    return (await exec.inspect()).ExitCode ?? -1;
};

const ensureImage = async (container: DockerContainer): Promise<void> => {
    const present = await docker().getImage(EDGE_IMAGE).inspect().then(() => true, () => false);
    if(!present) await pullImage(docker(), EDGE_IMAGE, { organizationId: container.organizationId, userId: container.userId });
};

const createEdge = async (container: DockerContainer, bindings: Binding[]): Promise<void> => {
    const network = await DockerNetwork.findOneBy({ id: container.networkId });
    if(!network?.dockerNetworkName) throw new Error('Container::Network::NotMaterialized');
    await ensureImage(container);

    const keys = bindings.map(({ internalPort, protocol }) => `${internalPort}/${protocol}`);
    const created = await docker().createContainer({
        name: edgeName(container),
        Image: EDGE_IMAGE,
        Entrypoint: ['sh', '-c', BOOT],
        Env: [`EDGE_CONFIG=${edgeConfig(container.dockerContainerName, bindings)}`],
        ExposedPorts: Object.fromEntries(keys.map((key) => [key, {}])),
        HostConfig: {
            PortBindings: Object.fromEntries(bindings.map((binding, index) => [keys[index], [{ HostPort: String(binding.externalPort) }]])),
            NetworkMode: network.dockerNetworkName,
            RestartPolicy: { Name: 'always' }
        }
    });
    await joinOrganizationNetwork(created.id, container.organizationId, internalHostname(container));
    await created.start();
};

/*
 * Makes the edge match the container's port bindings: created when missing, recreated when the
 * ports changed, started when stopped. A container from before edges still publishes its own ports,
 * and keeps them until its next release moves them here.
 */
export const ensureEdge = async (container: DockerContainer): Promise<void> => {
    const bindings = await PortBinding.findBy({ containerId: container.id });
    const [app, edge] = await Promise.all([inspect(container.dockerContainerName), inspect(edgeName(container))]);
    if(app !== null && hostPortsOf(app).size > 0) return;

    if(edge !== null){
        const published = hostPortsOf(edge);
        const current = bindings.length > 0
            && published.size === bindings.length
            && bindings.every(({ externalPort }) => published.has(externalPort));
        if(current){
            if(!edge.State.Running) await docker().getContainer(edge.Id).start();
            return;
        }
        await remove(edge.Id);
    }
    if(bindings.length > 0) await createEdge(container, bindings);
};

export const hasEdge = async (container: DockerContainer): Promise<boolean> =>
    (await inspect(edgeName(container)))?.State.Running === true;

export const pointEdge = async (container: DockerContainer, upstream: string): Promise<void> => {
    const bindings = await PortBinding.findBy({ containerId: container.id });
    const code = await exitCodeOf(edgeName(container), ['sh', '-c', RELOAD, 'sh', edgeConfig(upstream, bindings)]);
    if(code !== 0) throw new Error(`Could not point the edge of ${container.dockerContainerName} at ${upstream}`);
    await new Promise((resolve) => setTimeout(resolve, RELOAD_SETTLE_MS));
};

/* Whether `host` answers on `port`, asked from inside the edge, which shares the app's networks. */
export const edgeReaches = async (container: DockerContainer, host: string, port: number, path: string | null): Promise<boolean> => {
    const cmd = path === null
        ? ['nc', '-z', '-w', '2', host, String(port)]
        : ['wget', '-q', '-T', '3', '-O', '/dev/null', `http://${host}:${port}${path}`];
    return (await exitCodeOf(edgeName(container), cmd)) === 0;
};

export const removeEdge = (container: DockerContainer): Promise<void> => remove(edgeName(container));
