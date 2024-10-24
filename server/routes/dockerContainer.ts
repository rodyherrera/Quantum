import express from 'express';
import * as dockerContainerController from '@controllers/docker/container';
import * as authMiddleware from '@middlewares/authentication';
import DockerContainer from '@models/docker/container';
import { verifyOwnership } from '@middlewares/common';

const router = express.Router();

router.get('/random-available-port/', dockerContainerController.randomAvailablePort);

router.use(authMiddleware.protect);
router.get('/me/', dockerContainerController.getMyDockerContainers);
router.post('/', dockerContainerController.createDockerContainer);

router.use(verifyOwnership(DockerContainer));

router.get('/storage/:id/explore/:route?', dockerContainerController.storageExplorer);
router.get('/storage/:id/read/:route?', dockerContainerController.readContainerFile);
router.post('/storage/:id/overwrite/:route?', dockerContainerController.updateContainerFile);

router.route('/:id')
    .patch(dockerContainerController.updateDockerContainer)
    .delete(dockerContainerController.deleteDockerContainer);

export default router;