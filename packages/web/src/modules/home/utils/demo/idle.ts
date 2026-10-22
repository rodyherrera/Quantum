import type { RowActionHandlers } from '@/modules/application/components/ApplicationsTable';

export const IDLE = (): void => undefined;

export const IDLE_ROW_ACTIONS: RowActionHandlers = {
    onNavigate: IDLE,
    onDeleteApp: IDLE,
    onConnectionString: IDLE,
    onBackup: IDLE,
    onRestore: IDLE,
    onDeleteDatabase: IDLE,
    onUninstall: IDLE,
    onOperateInstall: IDLE,
    onRedeployInstall: IDLE
};
