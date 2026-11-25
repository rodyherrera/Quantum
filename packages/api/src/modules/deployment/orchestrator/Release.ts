import type Dockerode from 'dockerode';
import { getDockerHost } from './DockerHost';
import ContainerOps from './ContainerOps';
import { edgeReaches, ensureEdge, hasEdge, pointEdge } from './Edge';
import type DockerContainer from '@/modules/docker/models/DockerContainer';
import type Repository from '@/modules/repository/models/Repository';

const READY_TIMEOUT_MS = 120_000;
const WATCH_MS = 60_000;
const SETTLE_MS = 5_000;
const POLL_MS = 1_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const docker = (): Dockerode => getDockerHost().client();

const ignoreMissing = (error: { statusCode?: number }) => {
    if(error.statusCode === 304 || error.statusCode === 404) return;
    return Promise.reject(error);
};

const remove = (name: string): Promise<void> => docker().getContainer(name).remove({ force: true }).catch(ignoreMissing);

export const releaseNames = (base: string) => ({
    next: `${base}-next`,
    previous: `${base}-previous`,
    failed: `${base}-failed`
});

/* What an interrupted release can leave behind. */
export const clearLeftovers = async (container: DockerContainer): Promise<void> => {
    await Promise.all(Object.values(releaseNames(container.dockerContainerName)).map(remove));
};

/* Why a container is not fit to serve, or null while it is. `restarts` is how many restarts it had already. */
const problemOf = ({ State, RestartCount }: Dockerode.ContainerInspectInfo, restarts: number): string | null => {
    if(State.Health?.Status === 'unhealthy') return 'failed its health check';
    if(!State.Running || State.Restarting) return `exited with code ${State.ExitCode}`;
    if(RestartCount > restarts) return 'crashed and was restarted';
    return null;
};

/*
 * Ships an image to a repository container without taking the app down. The new container starts next
 * to the running one, and takes its name and its traffic only once it answers. The old one keeps
 * running for a minute after that, so a release that dies once it meets real traffic hands straight
 * back to the version that worked.
 */
export default class Release{
    #names: ReturnType<typeof releaseNames>;

    constructor(
        private container: DockerContainer,
        private repository: Pick<Repository, 'port' | 'healthCheckPath'>,
        private log: (line: string) => void
    ){
        this.#names = releaseNames(container.dockerContainerName);
    }

    /* Starts `image` next to the running app and gives it the traffic once it answers. */
    async takeOver(image: string): Promise<void>{
        const { next, previous } = this.#names;
        await clearLeftovers(this.container);
        await ensureEdge(this.container);

        this.log('[release] Starting the new version next to the running one\n');
        await new ContainerOps(this.container).createRelease(next, image);
        const problem = await this.#readiness(next, 0);
        if(problem !== null){
            await remove(next);
            throw new Error(`The new version ${problem}. The previous version is still serving.`);
        }

        this.log('[release] The new version answers, switching traffic to it\n');
        await this.#cutOver(next, previous);
    }

    /* Keeps the previous version warm for a while, and hands back to it if the new one goes down. */
    async settle(): Promise<void>{
        const { previous, failed } = this.#names;
        this.log(`[release] Watching the new version for ${WATCH_MS / 1000} seconds\n`);
        const crash = await this.#watch();
        if(crash === null){
            await remove(previous);
            this.log('[release] The previous version is retired\n');
            return;
        }

        this.log(`[release] The new version ${crash}, handing back to the previous one\n`);
        await docker().getContainer(previous).start().catch(ignoreMissing);
        const restarts = (await docker().getContainer(previous).inspect()).RestartCount;
        const problem = await this.#readiness(previous, restarts);
        if(problem !== null) throw new Error(`The new version ${crash}, and the previous version ${problem}.`);

        await this.#cutOver(previous, failed);
        await remove(failed);
        throw new Error(`The new version ${crash} after taking over. The previous version is serving again.`);
    }

    /*
     * Moves the traffic and the app's name from the running container to `incoming`, and parks the old
     * one as `parkAs`. The edge is pinned to the incoming address while the names change hands, so no
     * connection ever looks up a name that is briefly gone.
     */
    async #cutOver(incoming: string, parkAs: string): Promise<void>{
        const base = this.container.dockerContainerName;
        const edge = await hasEdge(this.container);

        if(edge) await pointEdge(this.container, await this.#addressOf(incoming));
        await docker().getContainer(base).rename({ name: parkAs }).catch(ignoreMissing);
        await docker().getContainer(incoming).rename({ name: base });

        if(edge){
            await pointEdge(this.container, base);
        }else{
            // Without an edge yet, the old container may still hold the published ports the edge needs.
            await docker().getContainer(parkAs).stop({ t: 10 }).catch(ignoreMissing);
            await ensureEdge(this.container);
        }
        await new ContainerOps(this.container).start();
    }

    /* Null once `name` answers, or why it never did. */
    async #readiness(name: string, restarts: number): Promise<string | null>{
        const { port, healthCheckPath } = this.repository;
        const probed = await hasEdge(this.container);
        const deadline = Date.now() + READY_TIMEOUT_MS;

        for(;;){
            const info = await docker().getContainer(name).inspect();
            const problem = problemOf(info, restarts);
            if(problem !== null) return `${problem} before it was ready`;

            const healthy = info.State.Health === undefined || info.State.Health.Status === 'healthy';
            const answers = port !== null && probed
                ? await edgeReaches(this.container, name, port, healthCheckPath)
                : Date.now() - Date.parse(info.State.StartedAt) >= SETTLE_MS;
            if(healthy && answers) return null;

            if(Date.now() >= deadline){
                const target = port === null ? '' : ` on port ${port}${healthCheckPath ?? ''}`;
                return `did not answer${target} within ${READY_TIMEOUT_MS / 60_000} minutes`;
            }
            await sleep(POLL_MS);
        }
    }

    async #watch(): Promise<string | null>{
        const until = Date.now() + WATCH_MS;
        while(Date.now() < until){
            await sleep(POLL_MS);
            const info = await docker().getContainer(this.container.dockerContainerName).inspect().catch(() => null);
            if(info === null) return 'disappeared';
            const problem = problemOf(info, 0);
            if(problem !== null) return problem;
        }
        return null;
    }

    async #addressOf(name: string): Promise<string>{
        const info = await docker().getContainer(name).inspect();
        const address = Object.values(info.NetworkSettings.Networks ?? {}).find((network) => network.IPAddress)?.IPAddress;
        if(!address) throw new Error(`${name} has no network address`);
        return address;
    }
}
