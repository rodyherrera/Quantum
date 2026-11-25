import { useEffect, useState } from 'react';
import { Button } from '@heroui/react';
import CodespaceAccessDialog from '@/modules/codespace/components/CodespaceAccessDialog';
import { useQuery } from '@/shared/hooks/api/use-query';
import { usePolledQuery } from '@/shared/hooks/api/use-polled-query';
import { useMutation } from '@/shared/hooks/api/use-mutation';
import { codespaceApi } from '@/modules/codespace/api/api';
import { isCodespaceTransient } from '@/modules/codespace/utils/status';
import { codespaceErrorMessages } from '@/modules/codespace/utils/error-messages';
import { isNotFound } from '@/shared/utils/errors';
import { errorCopy } from '@/shared/utils/error-copy';
import { CodespaceStatus } from '@quantum/contracts/modules/codespace/domain';
import type { Codespace } from '@quantum/contracts/modules/codespace/domain';

const copy = errorCopy(codespaceErrorMessages);

export type WorkspaceTarget =
    | { kind: 'repository'; id: number }
    | { kind: 'install'; id: number };

const lookup = (kind: WorkspaceTarget['kind'], id: number) =>
    kind === 'repository'
        ? codespaceApi.forRepository({ path: { repositoryId: id } })
        : codespaceApi.forInstall({ path: { installId: id } });

const open = (kind: WorkspaceTarget['kind'], id: number) =>
    kind === 'repository'
        ? codespaceApi.openForRepository({ path: { repositoryId: id } })
        : codespaceApi.openForInstall({ path: { installId: id } });

const labelFor = (codespace: Codespace | null): string => {
    if(codespace === null) return 'Open in VS Code';
    if(isCodespaceTransient(codespace.status)) return 'Preparing VS Code';
    if(codespace.status === CodespaceStatus.Running) return 'Access VS Code';
    return 'Open in VS Code';
};

interface WorkspaceButtonProps{
    target: WorkspaceTarget;
}

const WorkspaceButton = ({ target }: WorkspaceButtonProps) => {
    const query = useQuery(lookup, [target.kind, target.id]);
    const workspace = usePolledQuery(query, { while: (data) => isCodespaceTransient(data.status), everyMs: 3000 });
    const [awaiting, setAwaiting] = useState(false);
    const [showAccess, setShowAccess] = useState(false);

    const launch = useMutation(() => open(target.kind, target.id), {
        onSuccess: () => {
            setAwaiting(true);
            workspace.reload();
        }
    });
    const stop = useMutation((id: number) => codespaceApi.stop({ path: { id } }), {
        onSuccess: () => {
            setShowAccess(false);
            workspace.reload();
        }
    });

    const codespace = workspace.error !== undefined && isNotFound(workspace.error) ? null : workspace.data;
    const running = codespace?.status === CodespaceStatus.Running;

    useEffect(() => {
        if(!awaiting || !running) return;
        setAwaiting(false);
        setShowAccess(true);
    }, [awaiting, running]);

    const busy = launch.loading || (codespace !== null && isCodespaceTransient(codespace.status));
    const error = launch.error ?? stop.error ?? (workspace.error !== undefined && !isNotFound(workspace.error) ? workspace.error : undefined);

    return (
        <div className='flex flex-col items-end gap-1.5'>
            <Button
                variant='secondary'
                isPending={busy}
                isDisabled={workspace.loading}
                onPress={() => { if(running) setShowAccess(true); else void launch.run().catch(() => undefined); }}
            >
                {labelFor(codespace)}
            </Button>

            {error !== undefined && <span role='alert' className='max-w-xs text-right text-xs text-danger'>{copy(error)}</span>}

            <CodespaceAccessDialog
                codespace={showAccess && running ? codespace : null}
                onClose={() => setShowAccess(false)}
                onStop={codespace === null ? undefined : () => { void stop.run(codespace.id).catch(() => undefined); }}
                isStopping={stop.loading}
            />
        </div>
    );
};

export default WorkspaceButton;
