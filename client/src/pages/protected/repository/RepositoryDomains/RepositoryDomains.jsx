import React, { useEffect } from 'react';
import MinimalForm from '@components/general/MinimalForm';
import RelatedRepositorySections from '@components/repository/RelatedRepositorySections';
import { useSelector, useDispatch } from 'react-redux';
import { updateRepository } from '@services/repository/operations';
import { useNavigate } from 'react-router-dom';
import './RepositoryDomains.css';

const RepositoryDomains = () => {
    const { isOperationLoading, error, selectedRepository } = useSelector((state) => state.repository);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleFormSubmit = (formValues) => {
        formValues.domains = formValues.domains.split(',');
        dispatch(updateRepository(selectedRepository._id, formValues, navigate));
    };

    useEffect(() => {
        if(!selectedRepository)
            return navigate('/dashboard/');
    }, []);

    return (
        <MinimalForm
            headerTitle='Manage Repository Domains'
            headerSubtitle='Your repository can have one or more associated domains. You must specify the port on which your server is running on the Docker instance.'
            submitButtonTitle='Save Changes'
            error={error}
            isLoading={isOperationLoading}
            handleFormSubmit={handleFormSubmit}
            breadcrumbsItems={[
                { title: 'Home', to: '/' },
                { title: 'Dashboard', to: '/dashboard/' },
                { title: 'Repositories', to: '/dashboard/' },
                { title: selectedRepository?.name, to: '/dashboard/' },
                { title: 'Manage Domains', to: `/repository/${selectedRepository?.name}/domains/` }
            ]}
            RightContainerComponent={RelatedRepositorySections}
            formInputs={[
                {
                    type: 'text',
                    name: 'domains',
                    value: selectedRepository?.domains?.join(', '),
                    helperText: 'Add each domain without http:// or https://, we will take care of assigning a certificate and redirecting to https:// when necessary. Each assigned domain must be separated by a comma, for example: "foo.com, bar.com".',
                    placeholder: 'Example: "foo.com, bar.com, foobar.com, barfoo.com"'
                },
                {
                    type: 'number',
                    name: 'port',
                    value: selectedRepository?.port,
                    helperText: 'Your server is running in isolation on your Docker instance. You must specify the port on which your server is listening. For example "8080".',
                    placeholder: 'Example: "8080", "84443"'
                }
            ]}
        />
    );
};

export default RepositoryDomains;