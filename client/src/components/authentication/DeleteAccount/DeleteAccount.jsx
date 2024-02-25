import React, { useState } from 'react';
import Button from '@components/general/Button';
import ConfirmModal from '@components/general/ConfirmModal';
import { deleteMyProfile } from '@services/authentication/operations';
import { useDispatch, useSelector } from 'react-redux';
import './DeleteAccount.css';

const DeleteAccount = () => {
    const [isDeleteModalActive, setIsDeleteModalActive] = useState(false);
    const { isEliminatingAccount, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    return (
        <ConfirmModal
            highlightTitle='Deleting'
            title='Your Account'
            isActive={isDeleteModalActive}
            setIsActive={setIsDeleteModalActive}
            description='By proceeding, you are requesting the permanent removal of your Personal Account and all associated content from the Quantum platform. Please be aware that this action cannot be undone.'
            warning='After this, there is no turning back.'
            confirmHandler={() => dispatch(deleteMyProfile())}
            firstInputRender={(
                <span className='Confirm-Modal-Input-Title'>
                    Enter your username <span className='Font-Bold'>{user.username}</span> to continue:
                </span>
            )}
            firstInputMatch={user.username}
            lastInputRender={(
                <span className='Confirm-Modal-Input-Title'>
                    To verify, type <span className='Font-Bold'>delete my account</span> below:
                </span>
            )}
            lastInputMatch='delete my account'
        >
            <div className='Account-Page-Delete-Container'>
                <div className='Account-Page-Delete-Header-Container'>
                    <h3 className='Account-Page-Delete-Title'>Delete <span className='Account-Page-Delete-Title-Highlight'>Account</span></h3>
                    <p className='Account-Page-Delete-Description'>Permanently remove your Personal Account and all of its contents from the Quantum platform. This action is not reversible, so please continue with caution. Your services will be permanently deleted.</p>
                </div>
                <div className='Account-Page-Delete-Footer-Container'>
                    <Button 
                        isLoading={isEliminatingAccount}
                        onClick={() => setIsDeleteModalActive(true)}
                        variant='White'
                        title='Ok, I agree and I know the consequences.'
                    />
                </div>
            </div>
        </ConfirmModal>
    );
};

export default DeleteAccount;