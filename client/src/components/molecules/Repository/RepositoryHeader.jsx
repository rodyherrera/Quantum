import { DashboardCardHeader } from '@components/atoms/DashboardCard';

const RepositoryHeader = ({ repository }) => {
    const options = [
        repository.container.ipAddress ? `IPv4: ${repository.container.ipAddress}` : 'Unallocated Subnet IP',
        `Status: ${repository.activeDeployment.status}`,
        `${repository.container.portBindings.length} exposed ports`,
        `${repository.deployments.length} deployments`,
        `Branch: ${repository.branch}`,
        `Webhook: ${repository.webhookId}`,
        `ID: ${repository._id}`,
    ];

    return <DashboardCardHeader options={options} />
};

export default RepositoryHeader;