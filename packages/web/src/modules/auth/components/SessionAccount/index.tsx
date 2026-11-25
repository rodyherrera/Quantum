import { Link } from 'react-router-dom';
import { useSession } from '@/modules/auth/hooks/use-session';
import { useSidebarStore } from '@/shared/store/sidebar';
import type { User } from '@quantum/contracts/modules/user/domain';

interface AccountLinkProps{
    user: Pick<User, 'username' | 'fullname'>;
}

export const AccountLink = ({ user }: AccountLinkProps) => (
    <Link
        to='/account'
        aria-label={`Account settings for ${user.fullname}`}
        className='hidden min-w-0 items-center gap-2 rounded-md px-1.5 py-1 font-medium text-foreground transition-colors hover:bg-default focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent motion-reduce:transition-none lg:flex'
    >
        <span className='truncate'>{user.username}</span>
    </Link>
);

const SessionAccount = () => {
    const { user } = useSession();
    const collapsed = useSidebarStore((state) => state.collapsed);

    if(collapsed) return null;
    if(!user) return <span className='hidden h-5 w-24 animate-pulse rounded-md bg-default lg:inline-block' />;

    return <AccountLink user={user} />;
};

export default SessionAccount;
