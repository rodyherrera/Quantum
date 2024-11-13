import express from 'express';
import * as dockerContainerController from '@controllers/docker/container';
import * as authMiddleware from '@middlewares/authentication';
import DockerContainer from '@models/docker/container';
import { verifyOwnership } from '@middlewares/common';

const router = express.Router();
const ownership = verifyOwnership(DockerContainer);

router.get('/random-available-port/', dockerContainerController.randomAvailablePort);

router.use(authMiddleware.protect);
router.get('/me/', dockerContainerController.getMyDockerContainers);
router.post('/', dockerContainerController.createDockerContainer);
router.post('/one-click-deploy/', dockerContainerController.oneClickDeploy);
router.post('/:id/status/', ownership, dockerContainerController.containerStatus);

router.get('/storage/:id/explore/:route?', ownership, dockerContainerController.storageExplorer);
router.get('/storage/:id/read/:route?', ownership, dockerContainerController.readContainerFile);
router.post('/storage/:id/overwrite/:route?', ownership, dockerContainerController.updateContainerFile);

router.route('/:id')
    .patch(ownership, dockerContainerController.updateDockerContainer)
    .delete(ownership, dockerContainerController.deleteDockerContainer);

export default router;