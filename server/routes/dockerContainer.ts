import express from 'express';
import * as dockerContainerController from '@controllers/docker/container';
import * as authMiddleware from '@middlewares/authentication';

const router = express.Router();

router.get('/random-available-port/', dockerContainerController.randomAvailablePort);

router.use(authMiddleware.protect);
router.get('/me/', dockerContainerController.getMyDockerContainers);
router.post('/', dockerContainerController.createDockerContainer);
router.patch('/:id', dockerContainerController.updateDockerContainer);

export default router;