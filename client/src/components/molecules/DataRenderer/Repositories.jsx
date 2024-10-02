import React from 'react';
import Button from '@components/atoms/Button';
import Project from '@components/organisms/Project';
import useUserRepositories from '@hooks/api/user/useUserRepositories';
import DataRenderer from '@components/organisms/DataRenderer';
import DashboardModule from '@components/molecules/DashboardModule';
import { HiPlus } from 'react-icons/hi';
import { FiGithub } from 'react-icons/fi';

const RepositoriesDataRenderer = () => {
    const { repositories, isLoading, error } = useUserRepositories();
    return (
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
            headerRightContainer={() => (
                !isLoading && (
                    <Button 
                        to='/repository/create/'
                        title='Create new' 
                        variant='Contained End-Icon' 
                        icon={<HiPlus />} />
                )
            )}
        >
            <DashboardModule
                title='Your Github Repositories'
                Icon={FiGithub}
                createLink='/repository/create/'
                alias='repositorie(s)'
                total={5}
                results={1}
                RenderComponent={() => (
                    <div id='Dashboard-Projects-Container'>
                        {repositories.map((repository, index) => (
                            <Project key={index} repository={repository} />
                        ))}
                    </div>
                )}
            />

        </DataRenderer>   
    );
};

export default RepositoriesDataRenderer;