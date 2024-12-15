import React, { useEffect } from 'react';
import Repository from '@components/organisms/Repository';
import useUserRepositories from '@hooks/api/user/useUserRepositories';
import DataRenderer from '@components/organisms/DataRenderer';
import DashboardModule from '@components/molecules/DashboardModule';
import { FiGithub } from 'react-icons/fi';

const RepositoriesDataRenderer = ({ ...props }) => {
    const { repositories, isLoading, error, stats, isOperationLoading } = useUserRepositories();
    
    useEffect(() => {
        console.log(stats)
    }, [stats]);

    return (
        <DashboardModule
            title='Your Github Repositories'
            isOperationLoading={isOperationLoading}
            Icon={FiGithub}
            createLink='/repository/create/'
            alias='repositorie(s)'
            results={stats?.results?.total || 0}
            total={repositories?.length}
            RenderComponent={() => (
                <DataRenderer
                    title='Your Github Repositories'
                    error={error}
                    isLoading={isLoading}
                    data={repositories}
                    emptyDataMessage="You still don't have repositories."
                    emptyDataBtn={{
                        title: 'Create Repository',
                        to: '/repository/create/'
                    }}
                    useBasicLayout={true}
                    {...props}
                >
                    <div id='Dashboard-Projects-Container'>
                        {repositories.map((repository, index) => (
                            <Repository key={index} repository={repository} />
                        ))}
                    </div>
                </DataRenderer>
            )}
        />
    );
};

export default RepositoriesDataRenderer;