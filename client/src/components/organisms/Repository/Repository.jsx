import {
    RepositoryHeader,
    RepositoryBody,
    RepositoryFooter
} from '@components/molecules/Repository';
import { DashboardCard } from '@components/atoms/DashboardCard';

const Repository = ({ repository }) => {

    return (
        <DashboardCard>
            <RepositoryHeader repository={repository} />
            <RepositoryBody repository={repository} />
            <RepositoryFooter repository={repository} />
        </DashboardCard>
    );
};

export default Repository;