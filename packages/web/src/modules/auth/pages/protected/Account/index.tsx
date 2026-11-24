import { useNavigate } from 'react-router-dom';
import { FieldsSkeleton } from '@/shared/components/skeletons';
import { Button } from '@heroui/react';
import { ArrowRight } from 'lucide-react';
import { useSession } from '@/modules/auth/hooks/use-session';
import PageBody from '@/shared/components/layout/PageBody';
import PageHeader from '@/shared/components/layout/PageHeader';
import SettingsRow from '@/shared/components/SettingsRow';
import SettingsSection from '@/shared/components/SettingsSection';

const Account = () => {
    const { user } = useSession();
    const navigate = useNavigate();

    if(user === null){
        return (
            <PageBody>
                
                <FieldsSkeleton className='mt-10' rows={4} />
            </PageBody>
        );
    }

    const facts: [string, string, boolean][] = [
        ['Username', user.username, true],
        ['Full name', user.fullname, false],
        ['Email', user.email, true],
        ['Role', user.role, false]
    ];

    return (
        <PageBody>
            <PageHeader
                eyebrow='Settings'
                title='Account'
                description='Who you are to Quantum, and how you sign in.'
            />

            <div className='mt-10 flex flex-col'>
                <SettingsSection title='Profile' description='What Quantum knows about you.'>
                    <div className='flex flex-col'>
                        {facts.map(([label, value, isIdentifier]) => (
                            <div
                                key={label}
                                className='flex items-center justify-between gap-4 border-b border-separator py-3 last:border-0'
                            >
                                <span className='text-sm text-foreground'>{label}</span>
                                <span className={isIdentifier ? 'font-mono text-[0.8125rem] text-muted' : 'text-sm text-muted'}>
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>
                </SettingsSection>

                <SettingsSection title='Security'>
                    <SettingsRow
                        title='Password'
                        description='Changing it needs the one you use today, so it stays behind a step.'
                        action={(
                            <Button variant='secondary' onPress={() => navigate('/change-password')}>
                                Change password
                                <ArrowRight aria-hidden='true' className='size-4' />
                            </Button>
                        )}
                    />
                </SettingsSection>
            </div>
        </PageBody>
    );
};

export default Account;
