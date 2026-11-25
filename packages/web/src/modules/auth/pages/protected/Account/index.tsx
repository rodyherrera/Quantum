import { useNavigate } from 'react-router-dom';
import { FieldsSkeleton } from '@/shared/components/skeletons';
import { Button, Chip } from '@heroui/react';
import { useSession } from '@/modules/auth/hooks/use-session';
import PageBar from '@/shared/components/layout/PageBar';
import PageBody from '@/shared/components/layout/PageBody';
import PageIntro from '@/shared/components/layout/PageIntro';
import SettingsRow from '@/shared/components/SettingsRow';
import SettingsSection from '@/shared/components/SettingsSection';
import { SETTINGS_TRAIL } from '@/modules/organization/utils/settings-trail';
import { UserRole } from '@quantum/contracts/modules/user/domain';

const ROLE_LABEL: Record<UserRole, string> = {
    [UserRole.User]: 'User',
    [UserRole.Admin]: 'Admin'
};

const Account = () => {
    const { user } = useSession();
    const navigate = useNavigate();

    return (
        <>
            <PageBar title='Account' trail={SETTINGS_TRAIL} />

            <PageBody variant='narrow'>
                <div className='flex flex-col gap-8'>
                    <PageIntro title='Account' description='Who you are to Quantum, and how you sign in.' />

                    {user === null ? <FieldsSkeleton rows={4} /> : (
                        <>
                            <SettingsSection title='Profile' description='What Quantum knows about you.'>
                                <SettingsRow title='Username' action={<span className='font-mono text-xs text-muted'>{user.username}</span>} />
                                <SettingsRow title='Full name' action={<span className='text-muted'>{user.fullname}</span>} />
                                <SettingsRow title='Email' action={<span className='font-mono text-xs text-muted'>{user.email}</span>} />
                                <SettingsRow title='Role' action={<Chip size='sm'>{ROLE_LABEL[user.role]}</Chip>} />
                            </SettingsSection>

                            <SettingsSection title='Security'>
                                <SettingsRow
                                    title='Password'
                                    description='Changing it needs the one you use today.'
                                    action={(
                                        <Button size='sm' variant='secondary' onPress={() => navigate('/change-password')}>
                                            Change password
                                        </Button>
                                    )}
                                />
                            </SettingsSection>
                        </>
                    )}
                </div>
            </PageBody>
        </>
    );
};

export default Account;
