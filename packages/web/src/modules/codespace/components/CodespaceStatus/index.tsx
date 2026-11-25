import StatusText from '@/shared/components/StatusText';
import { codespaceStatusColor, codespaceStatusLabel } from '@/modules/codespace/utils/status';
import type { CodespaceStatus as Status } from '@quantum/contracts/modules/codespace/domain';

const CodespaceStatus = ({ status }: { status: Status }) => (
    <StatusText color={codespaceStatusColor(status)} label={codespaceStatusLabel(status)} />
);

export default CodespaceStatus;
