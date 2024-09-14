import express from 'express';
import * as dockerContainerController from '@controllers/dockerContainer';
import * as authMiddleware from '@middlewares/authentication';

const router = express.Router();

router.use(authMiddleware.protect);
router.get('/me/', dockerContainerController.getMyDockerContainers);
router.post('/', dockerContainerController.createDockerContainer);

export default router;