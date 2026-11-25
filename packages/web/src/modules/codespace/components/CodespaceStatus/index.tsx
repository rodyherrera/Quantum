import StatusDot from '@/shared/components/StatusDot';
import { codespaceStatusColor, codespaceStatusLabel, isCodespaceTransient } from '@/modules/codespace/utils/status';
import type { CodespaceStatus as Status } from '@quantum/contracts/modules/codespace/domain';

const CodespaceStatus = ({ status }: { status: Status }) => (
    <StatusDot color={codespaceStatusColor(status)} label={codespaceStatusLabel(status)} isTransient={isCodespaceTransient(status)} />
);

export default CodespaceStatus;
