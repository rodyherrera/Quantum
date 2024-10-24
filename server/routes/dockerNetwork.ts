import express from 'express';
import * as dockerNetworkController from '@controllers/docker/network';
import * as authMiddleware from '@middlewares/authentication';
import DockerNetwork from '@models/docker/network';
import { verifyOwnership } from '@middlewares/common';

const router = express.Router();
const ownership = verifyOwnership(DockerNetwork);

router.use(authMiddleware.protect);
router.get('/me/', dockerNetworkController.getMyDockersNetwork);
router.post('/', dockerNetworkController.createDockerNetwork);

router.route('/:id')
    .get(ownership, dockerNetworkController.getDockerNetwork)
    .patch(ownership, dockerNetworkController.updateDockerNetwork)
    .delete(ownership, dockerNetworkController.deleteDockerNetwork);

router.use(authMiddleware.restrictTo('admin'));
router.get('/', dockerNetworkController.getDockerNetworks);

export default router;