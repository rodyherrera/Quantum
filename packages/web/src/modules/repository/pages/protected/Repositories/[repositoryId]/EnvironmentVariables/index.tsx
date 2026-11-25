import { useParams } from 'react-router-dom';
import { FieldsSkeleton } from '@/shared/components/skeletons';
import { Rocket } from 'lucide-react';
import ErrorState from '@/shared/components/ErrorState';
import EmptyState from '@/shared/components/EmptyState';
import CenterState from '@/shared/components/CenterState';
import EnvironmentVariablesEditor from '@/shared/components/EnvironmentVariablesEditor';
import { useQuery } from '@/shared/hooks/api/use-query';
import { deploymentApi } from '@/modules/repository/api/deployment-api';
import { isNotFound } from '@/shared/utils/errors';
import { deploymentErrorMessages } from '@/modules/repository/utils/error-messages';
import { errorCopy } from '@/shared/utils/error-copy';

const copy = errorCopy(deploymentErrorMessages);

const NoDeploymentYet = () => (
    <CenterState>
        <EmptyState
            icon={Rocket}
            title='No deployment yet'
            description='Environment variables become available after your first deploy.'
        />
    </CenterState>
);

const EnvironmentVariables = () => {
    const { repositoryId } = useParams<{ repositoryId: string }>();
    const id = repositoryId !== undefined ? Number(repositoryId) : undefined;
    const environment = useQuery((repositoryId: number) => deploymentApi.environment({ path: { repositoryId } }), [id]);

    if(id === undefined || environment.loading){
        return <FieldsSkeleton rows={4} />;
    }

    if(environment.error !== undefined){
        if(isNotFound(environment.error)) return <NoDeploymentYet />;

        return (
            <CenterState>
                <ErrorState
                    title='Could not load environment variables'
                    description={copy(environment.error)}
                    onRetry={environment.reload}
                />
            </CenterState>
        );
    }

    const data = environment.data;
    if(data === null) return <NoDeploymentYet />;

    return (
        <EnvironmentVariablesEditor
            key={data.deploymentId}
            variables={data.environmentVariables}
            save={(environmentVariables) => deploymentApi.update({ path: { id: data.deploymentId }, body: { environmentVariables } })}
            getErrorMessage={copy}
            description='Available to your app at build and run time, and carried over to every new deployment. A .env at the repository root fills in any variable not set here. Saved automatically; redeploy to apply.'
            emptyDescription='Add a variable to make it available to your app at build and run time.'
        />
    );
};

export default EnvironmentVariables;
