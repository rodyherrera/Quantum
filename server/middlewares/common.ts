import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '@utilities/helpers';
import { IUser } from '@typings/models/user';
import { Model } from 'mongoose';
import RuntimeError from '@utilities/runtimeError';

export const verifyOwnership = (model: Model<any>) => {
    return catchAsync(async (req: Request, _: Response, next: NextFunction) => {
        const user = req.user as IUser;
        // If the user's role is administrator, we will not verify ownership.
        if(user.role === 'admin') return next();
        const { id } = req.params;
        const document = await model.findOne({ _id: id, user: user._id });
        if(!document){
            throw new RuntimeError('Core::Middlewares::VerifyOwnership::RecordNotFound', 404);
        }
        next();
    });
};