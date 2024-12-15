import { DashboardCardBody } from '@components/atoms/DashboardCard';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setState as repoSetState } from '@services/repository/slice';
import { deleteRepository } from '@services/repository/operations';
import ConfirmModal from '@components/organisms/ConfirmModal';

const RepositoryBody = ({ repository }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isDeleteModalActive, setIsDeleteModalActive] = useState(false);
    const { repositories } = useSelector(state => state.repository);
    const ctxMenuOpts = [
        { title: 'Delete', onClick: () => setIsDeleteModalActive(true) },
        { title: 'Manage Domains', onClick: () => handleRepositorySelection(`/repository/${repository.alias}/domains/`) },
        { title: 'Build & Dev Settings',  onClick: () => handleRepositorySelection() },
        { title: 'Environment Variables',  onClick: () => handleRepositorySelection() },
        { title: 'File Explorer',  onClick: () => handleRepositorySelection() },
        { title: 'Shell', onClick: () => handleRepositorySelection() },
        { title: 'Deployments', onClick: () => handleRepositorySelection() }
    ];

    const handleRepositorySelection = (path) => {
        dispatch(repoSetState({ path: 'selectedRepository', value: repository }));
        navigate(path);
    };
    
    useEffect(() => {
        console.log(repository);
    }, [repository]);

    return (
        <ConfirmModal
            highlightTitle='Delete'
            title='Project'
            isActive={isDeleteModalActive}
            setIsActive={setIsDeleteModalActive}
            description='The deployments associated with your repository along with all its configuration within the platform will be permanently deleted. Only deployments associated with your account will be deleted.'
            warning='This action is not reversible. Please be certain.'
            confirmHandler={() => dispatch(deleteRepository(repository._id, repositories, navigate))}
            firstInputRender={(
                <span className='Confirm-Modal-Input-Title'>
                    Enter the project name <span className='Font-Bold'>{repository.name}</span> to continue:
                </span>
            )}
            firstInputMatch={repository.name}
            lastInputRender={(
                <span className='Confirm-Modal-Input-Title'>
                    To verify, type <span className='Font-Bold'>delete my project</span> below:
                </span>
            )}
            lastInputMatch='delete my project'
        >
            <DashboardCardBody
                name={`${repository.alias}`}
                ctxMenuOpts={ctxMenuOpts}
                createdAt={repository.createdAt}
                updatedAt={repository.updatedAt} 
            />
        </ConfirmModal>
    );
};

export default RepositoryBody;