import express from 'express';
import * as portBindingController from '@controllers/portBinding';
import * as authMiddleware from '@middlewares/authentication';
import PortBinding from '@models/portBinding';
import { verifyOwnership } from '@middlewares/common';

const router = express.Router();
const ownership = verifyOwnership(PortBinding);

router.use(authMiddleware.protect);
router.get('/me/', portBindingController.getMyPortBindings);
router.post('/', portBindingController.createPortBinding);

router.route('/:id')
    .get(ownership, portBindingController.getPortBinding)
    .patch(ownership, portBindingController.updatePortBinding)
    .delete(ownership, portBindingController.deletePortBinding);

router.use(authMiddleware.restrictTo('admin'));
router.get('/', portBindingController.getPortBindings);

export default router;