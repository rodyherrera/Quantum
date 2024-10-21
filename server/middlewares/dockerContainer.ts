import DockerContainer from '@models/docker/container';
import RuntimeError from '@utilities/runtimeError';
import { catchAsync } from '@utilities/helpers';
import { NextFunction } from 'express';
import { IUser } from '@typings/models/user';

// refactor with @middlewares/repository.ts
export const verifyOwnership = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    if(user.role === 'admin') return next();
    const { id } = req.params;
    const container = await DockerContainer.findOne({ _id: id, user: user._id });
    if(!container){
        throw new RuntimeError('Docker::Container::Not::Found', 404);
    }
    next();
});