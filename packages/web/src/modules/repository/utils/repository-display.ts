import { RUNTIME_OPTIONS } from '@/modules/repository/utils/create-repository-form';
import type { Repository } from '@quantum/contracts/modules/repository/domain';

export const displayName = (repository: Repository): string => (repository.name !== '' ? repository.name : repository.alias);

export const sourcePath = (url: string): string => url.replace(/^https?:\/\/[^/]+\//, '').replace(/\.git$/, '');

export const runtimeLabel = (repository: Repository): string | null => {
    if(repository.runtime === null) return null;
    const name = RUNTIME_OPTIONS.find((option) => option.value === repository.runtime)?.label ?? repository.runtime;
    return repository.runtimeVersion === null ? name : `${name} ${repository.runtimeVersion}`;
};
