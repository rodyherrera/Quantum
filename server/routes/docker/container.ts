import express from 'express';
import * as dockerContainerController from '@controllers/docker/container';
import * as authMiddleware from '@middlewares/authentication';
import DockerContainer from '@models/docker/container';
import DockerFS from '@controllers/common/dockerFS';
import { verifyOwnership } from '@middlewares/common';

const router = express.Router();
const containerFS = new DockerFS();
const ownership = verifyOwnership(DockerContainer);

router.get('/random-available-port/', dockerContainerController.randomAvailablePort);

router.use(authMiddleware.protect);
router.get('/me/', dockerContainerController.getMyDockerContainers);
router.post('/', dockerContainerController.createDockerContainer);
router.get('/count-containers-by-status/', dockerContainerController.countUserContainersByStatus);
router.post('/one-click-deploy/', dockerContainerController.oneClickDeploy);
router.post('/:id/status/', ownership, dockerContainerController.containerStatus);

router.get('/storage/:id/explore/:route?', ownership, containerFS.storageExplorer);
router.get('/storage/:id/read/:route?', ownership, containerFS.readContainerFile);
router.post('/storage/:id/overwrite/:route?', ownership, containerFS.updateContainerFile);

router.route('/:id')
    .patch(ownership, dockerContainerController.updateDockerContainer)
    .delete(ownership, dockerContainerController.deleteDockerContainer);

export default router;