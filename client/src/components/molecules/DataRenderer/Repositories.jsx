import React from 'react';
import Project from '@components/organisms/Project';
import useUserRepositories from '@hooks/api/user/useUserRepositories';
import DataRenderer from '@components/organisms/DataRenderer';
import DashboardModule from '@components/molecules/DashboardModule';
import { FiGithub } from 'react-icons/fi';

const RepositoriesDataRenderer = ({ ...props }) => {
    const { repositories, isLoading, error, stats, isOperationLoading } = useUserRepositories();

    return (
        <DashboardModule
            title='Your Github Repositories'
            isOperationLoading={isOperationLoading}
            Icon={FiGithub}
            createLink='/repository/create/'
            alias='repositorie(s)'
            results={stats?.results?.total}
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
                            <Project key={index} repository={repository} />
                        ))}
                    </div>
                </DataRenderer>
            )}
        />
    );
};

export default RepositoriesDataRenderer;