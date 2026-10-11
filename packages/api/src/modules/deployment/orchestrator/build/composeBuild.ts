import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import type Dockerode from 'dockerode';
import { TemplateInstallError } from '@/modules/template/contracts/domain/errors';
import type { TemplateServiceBuild } from '@quantum/contracts/modules/template/domain';

const run = promisify(execFile);

interface BuildFrame{
    error?: string;
    errorDetail?: { message?: string };
}

export const insideSource = (sourcePath: string, relative: string): string => {
    const resolved = path.resolve(sourcePath, relative);
    if(resolved !== sourcePath && !resolved.startsWith(sourcePath + path.sep)) throw TemplateInstallError.ComposeFileNotFound(relative);
    return resolved;
};

const COPY_LINE = /^\s*COPY(?:\s+--\S+)*\s+(.+)$/i;
const ADD_LINE = /^\s*ADD(?:\s+--\S+)*\s+(.+)$/i;

const stripFlags = (rest: string): string[] => {
    const tokens = rest.trim().split(/\s+/);
    while(tokens[0]?.startsWith('--')) tokens.shift();
    return tokens;
};

const sourcesOf = (line: string): string[] => {
    if(/\s--from=/.test(line)) return [];
    const copy = line.match(COPY_LINE);
    const add = copy ? null : line.match(ADD_LINE);
    const rest = copy?.[1] ?? add?.[1];
    if(rest === undefined) return [];
    const tokens = stripFlags(rest);
    if(tokens.length < 2) return [];
    return tokens.slice(0, -1).filter((token) => token !== '');
};

export const composeImageInputs = async (
    sourcePath: string,
    composeDir: string,
    build: TemplateServiceBuild
): Promise<string[]> => {
    const context = insideSource(sourcePath, path.join(composeDir, build.context));
    const dockerfilePath = build.dockerfile === undefined
        ? path.join(context, 'Dockerfile')
        : insideSource(sourcePath, path.join(composeDir, build.context, build.dockerfile));
    const dockerfile = await readFile(dockerfilePath, 'utf8');
    const sources = dockerfile.split('\n').flatMap(sourcesOf).map((source) =>
        path.relative(sourcePath, path.resolve(context, source)));
    return [path.relative(sourcePath, dockerfilePath), ...sources];
};

export const composeImageFingerprint = async (
    sourcePath: string,
    composeDir: string,
    build: TemplateServiceBuild
): Promise<string> => {
    const inputs = await composeImageInputs(sourcePath, composeDir, build);
    const hashes = await Promise.all(inputs.map(async (input) => {
        try{
            const { stdout } = await run('git', ['-C', sourcePath, 'rev-parse', `HEAD:${input}`]);
            return `${input}\t${stdout.trim()}`;
        }catch{
        }
        try{
            const { stdout } = await run('git', ['-C', sourcePath, 'ls-files', '-s', '--', input], { maxBuffer: 8 * 1024 * 1024 });
            if(stdout.trim() !== '') return stdout;
        }catch{
        }
        return `${input}\tmissing`;
    }));
    const recipe = JSON.stringify({
        dockerfile: build.dockerfile ?? 'Dockerfile',
        target: build.target ?? '',
        args: build.args ?? {},
        inputs: hashes
    });
    return createHash('sha256').update(recipe).digest('hex').slice(0, 12);
};

export const imageExists = async (docker: Dockerode, tag: string): Promise<boolean> => {
    try{
        await docker.getImage(tag).inspect();
        return true;
    }catch{
        return false;
    }
};

export const buildComposeImage = async (
    docker: Dockerode,
    sourcePath: string,
    composeDir: string,
    build: TemplateServiceBuild,
    tag: string
): Promise<void> => {
    const context = insideSource(sourcePath, path.join(composeDir, build.context));
    const dockerfile = build.dockerfile === undefined
        ? undefined
        : path.relative(context, insideSource(sourcePath, path.join(composeDir, build.context, build.dockerfile)));

    const stream = await docker.buildImage({ context, src: ['.'] }, {
        t: tag,
        dockerfile,
        target: build.target,
        buildargs: build.args
    });

    await new Promise<void>((resolve, reject) => {
        docker.modem.followProgress(stream, (error: Error | null, output: BuildFrame[]) => {
            if(error) return reject(error);
            const failure = (output ?? []).find((frame) => frame.error || frame.errorDetail);
            if(failure) return reject(new Error(failure.error || failure.errorDetail?.message || 'docker build failed'));
            resolve();
        });
    });
};
