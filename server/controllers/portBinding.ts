import PortBinding from '@models/portBinding';
import HandlerFactory from '@controllers/common/handlerFactory';

const PortBindingFactory = new HandlerFactory({
    model: PortBinding,
    fields: [
        'internalPort',
        'externalPort',
        'protocol'
    ]
});

export const getPortBindings = PortBindingFactory.getAll();
export const getPortBinding = PortBindingFactory.getOne();
export const createPortBinding = PortBindingFactory.createOne();
export const updatePortBinding = PortBindingFactory.updateOne();
export const deletePortBinding = PortBindingFactory.deleteOne();

export const getMyPortBindings = PortBindingFactory.getAll({
    pre: [(req, query) => {
        query.user = req.user;
        return query;
    }]
});