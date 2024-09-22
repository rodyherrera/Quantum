import express from 'express';
import * as portBindingController from '@controllers/portBinding';
import * as authMiddleware from '@middlewares/authentication';

const router = express.Router();

router.use(authMiddleware.protect);
router.post('/me/', portBindingController.getMyPortBindings);
router.post('/', portBindingController.createPortBinding);

router.use(authMiddleware.restrictTo('admin'));
router.get('/', portBindingController.getPortBindings);

router.route('/:id')
    .get(portBindingController.getPortBinding)
    .patch(portBindingController.updatePortBinding)
    .delete(portBindingController.deletePortBinding);

export default router;