import { createApi } from '@/shared/api/create-api';
import { serverRoutes } from '@quantum/contracts/modules/server/routes';

export const serverApi = createApi(serverRoutes);
