import express from 'express';
import * as dockerImageController from '@controllers/docker/image';
import * as authMiddleware from '@middlewares/authentication';
import DockerImage from '@models/docker/image';
import { verifyOwnership } from '@middlewares/common';

const router = express.Router();
const ownership = verifyOwnership(DockerImage);

router.use(authMiddleware.protect);
router.get('/me/', dockerImageController.getMyDockersImage);
router.post('/', dockerImageController.createDockerImage);

router.route('/:id')
    .get(ownership, dockerImageController.getDockerImage)
    .patch(ownership, dockerImageController.updateDockerImage)
    .delete(ownership, dockerImageController.deleteDockerImage);

router.use(authMiddleware.restrictTo('admin'));
router.get('/', dockerImageController.getDockerImages)

export default router;