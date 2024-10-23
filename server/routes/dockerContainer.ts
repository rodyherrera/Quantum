import express from 'express';
import * as dockerContainerController from '@controllers/docker/container';
import * as authMiddleware from '@middlewares/authentication';
import * as dockerContainerMiddleware from '@middlewares/dockerContainer';

const router = express.Router();

router.get('/random-available-port/', dockerContainerController.randomAvailablePort);

router.use(authMiddleware.protect);

router.get('/storage/:id/explore/:route?',
    dockerContainerMiddleware.verifyOwnership,
    dockerContainerController.storageExplorer);

router.get('/storage/:id/read/:route?',
    dockerContainerMiddleware.verifyOwnership,
    dockerContainerController.readContainerFile);

router.post('/storage/:id/overwrite/:route?',
    dockerContainerMiddleware.verifyOwnership,
    dockerContainerController.updateContainerFile);

router.get('/me/', dockerContainerController.getMyDockerContainers);
router.post('/', dockerContainerController.createDockerContainer);

router.route('/:id')
    .patch(dockerContainerMiddleware.verifyOwnership, dockerContainerController.updateDockerContainer)
    .delete(dockerContainerMiddleware.verifyOwnership, dockerContainerController.deleteDockerContainer);

export default router;