import Property, { PropertyGroup } from '@/shared/components/detail/Property';
import StatusText from '@/shared/components/StatusText';
import InternalAddress from '@/shared/components/InternalAddress';
import PortLinks from '@/modules/repository/components/PortLinks';
import { containerStatusColor, containerStatusLabel } from '@/modules/application/utils/container-status';
import { BUILD_STRATEGY_LABELS } from '@/modules/repository/utils/build-strategy';
import { runtimeLabel, sourcePath } from '@/modules/repository/utils/repository-display';
import { formatDate } from '@/shared/utils/format-date';
import type { Repository } from '@quantum/contracts/modules/repository/domain';

const Unset = () => <span className='font-normal text-subtle'>—</span>;

interface RepositoryPropertiesProps{
    repository: Repository;
}

const RepositoryProperties = ({ repository }: RepositoryPropertiesProps) => {
    const runtime = runtimeLabel(repository);

    return (
        <>
            <PropertyGroup title='Properties'>
                <Property label='Status'>
                    <StatusText color={containerStatusColor(repository.containerStatus)} label={containerStatusLabel(repository.containerStatus)} />
                </Property>

                <Property label='Repository'>
                    <a
                        href={repository.url}
                        target='_blank'
                        rel='noreferrer'
                        title={repository.url}
                        className='truncate underline-offset-2 hover:underline'
                    >
                        {sourcePath(repository.url)}
                    </a>
                </Property>

                <Property label='Branch'>
                    <span className='truncate font-mono text-xs font-normal'>{repository.branch}</span>
                </Property>

                <Property label='Build'>
                    {BUILD_STRATEGY_LABELS[repository.buildStrategy]}
                </Property>

                <Property label='Framework'>
                    {repository.framework === null ? <Unset /> : <span className='truncate'>{repository.framework}</span>}
                </Property>

                <Property label='Runtime'>
                    {runtime === null ? <Unset /> : <span className='truncate'>{runtime}</span>}
                </Property>

                <Property label='Created'>
                    <time dateTime={repository.createdAt}>{formatDate(repository.createdAt)}</time>
                </Property>
            </PropertyGroup>

            <PropertyGroup title='Network'>
                <Property label='Address'>
                    <InternalAddress address={repository.address} />
                </Property>

                <Property label='Port'>
                    {repository.port === null ? <Unset /> : <span className='font-mono text-xs font-normal'>{repository.port}</span>}
                </Property>

                <Property label='Published'>
                    {repository.ports.length === 0 ? <Unset /> : (
                        <span className='flex min-w-0 flex-wrap gap-1 py-1'>
                            <PortLinks ports={repository.ports} />
                        </span>
                    )}
                </Property>

                <Property label='Volumes'>
                    {repository.volumes.length === 0 ? <Unset /> : (
                        <span className='flex min-w-0 flex-col py-1'>
                            {repository.volumes.map((volume) => (
                                <span key={volume} title={volume} className='truncate font-mono text-xs font-normal'>{volume}</span>
                            ))}
                        </span>
                    )}
                </Property>
            </PropertyGroup>
        </>
    );
};

export default RepositoryProperties;
