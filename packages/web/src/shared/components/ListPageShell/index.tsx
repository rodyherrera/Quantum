import EmptyState from '@/shared/components/EmptyState';
import ErrorState from '@/shared/components/ErrorState';
import CenterState from '@/shared/components/CenterState';
import { TableSkeleton } from '@/shared/components/skeletons';
import type { ReactNode } from 'react';

export interface ListPageStateSpec{
    title: string;
    description?: string;
    action?: ReactNode;
}

interface ListPageShellProps{
    loading?: boolean;
    skeleton?: ReactNode;
    error?: Error | undefined;
    errorTitle: string;
    getErrorDescription: (error: Error) => string;
    onRetry: () => void;
    showPrompt?: boolean;
    prompt?: ListPageStateSpec;
    isEmpty?: boolean;
    empty?: ListPageStateSpec;
    fill?: boolean;
    bare?: boolean;
    children?: ReactNode;
}

const ListPageShell = ({
    loading = false,
    skeleton,
    error = undefined,
    errorTitle,
    getErrorDescription,
    onRetry,
    showPrompt = false,
    prompt,
    isEmpty = false,
    empty,
    fill = false,
    bare = false,
    children
}: ListPageShellProps) => {
    const wrap = (node: ReactNode) => {
        if(bare) return <>{node}</>;
        return <CenterState className={fill ? 'h-full' : undefined}>{node}</CenterState>;
    };

    if(showPrompt && prompt !== undefined){
        return wrap(
            <EmptyState title={prompt.title} description={prompt.description}>
                {prompt.action}
            </EmptyState>
        );
    }

    if(loading) return <>{skeleton ?? <TableSkeleton />}</>;

    if(error !== undefined){
        return wrap(<ErrorState title={errorTitle} description={getErrorDescription(error)} onRetry={onRetry} />);
    }

    if(isEmpty && empty !== undefined){
        return wrap(
            <EmptyState title={empty.title} description={empty.description}>
                {empty.action}
            </EmptyState>
        );
    }

    return <>{children}</>;
};

export default ListPageShell;
