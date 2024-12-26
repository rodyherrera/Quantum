import { IoCloudOutline } from 'react-icons/io5';
import { CiServer, CiCloudOff, CiRedo, CiCloudOn } from 'react-icons/ci';
import { DashboardCardFooter } from '@components/atoms/DashboardCard';
import { GoTerminal } from 'react-icons/go';
import { repositoryActions } from '@services/deployment/operations';
import { useDispatch } from 'react-redux';
import { PiDatabaseThin, PiShareNetworkThin } from "react-icons/pi";
import { setState as repoSetState } from '@services/repository/slice';
import { setState as dockerContainerSetState } from '@services/docker/container/slice';

const RepositoryFooter = ({ repository }) => {
    const dispatch = useDispatch();

    const repositoryStatusHandler = async (action) => {
        dispatch(repositoryActions(repository.alias, { action }));
    };

    const handleRepositorySelection = () => {
        dispatch(repoSetState({ path: 'selectedRepository', value: repository }));
    };

    const selectContainerHandler = () => {
        const { environment } = repository.container;
        const variables = Object.entries(environment.variables);
        dispatch(dockerContainerSetState({
            path: 'selectedDockerContainer',
            value: { ...repository.container, environment: { variables } }
        }));
    };

    const options = [
        ['Terminal', GoTerminal, `/repository/${repository.alias}/shell/`, handleRepositorySelection],
        ['Expose Port', IoCloudOutline, '/port-binding/create/', selectContainerHandler],
        repository.activeDeployment.status === 'success' ? 
            ['Stop', CiCloudOff, null, () => repositoryStatusHandler('stop')] : 
            ['Start', CiCloudOn, null, () => repositoryStatusHandler('start')],
        ['Restart', CiRedo, null, () => repositoryStatusHandler('restart')],
        ['File Explorer', CiServer, `/docker-container/${repository.container._id}/storage/`, selectContainerHandler],
        ['Environment', PiDatabaseThin, `/repository/${repository.alias.toLowerCase()}/deployment/environment-variables/`, handleRepositorySelection],
        ['Deployments', PiShareNetworkThin, `/repository/${repository.alias}/deployments/`, handleRepositorySelection]
    ];

    return <DashboardCardFooter options={options} />
};

export default RepositoryFooter;