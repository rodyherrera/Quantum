import { IRequest } from '@typings/controllers/common'
import { catchAsync } from '@utilities/helpers';
import { NextFunction, Response } from 'express';
import { IUser } from '@typings/models/user';
import DockerContainer from '@models/docker/container';
import Repository from '@models/repository';
import RuntimeError from '@utilities/runtimeError';
import path from 'path';
import fs from 'fs';

class DockerFS{
    private isRepositoryContainer: boolean;

    constructor(isRepositoryContainer: boolean = false){
        this.isRepositoryContainer = isRepositoryContainer;
    }

    private async getRequestedPath(req: IRequest, next: NextFunction): Promise<string>{
        let storagePath;
        const user = req.user as IUser;
        if(this.isRepositoryContainer){
            const repository = await Repository
                .findOne({ _id: req.params.id, user: user._id })
                .populate({
                    path: 'container',
                    select: 'storagePath'
                })
                .lean();
            if(!repository){
                throw new RuntimeError('DockerFS::StorageExplorer::NotFound', 404);
            }
            storagePath = repository.container.storagePath;
        }else{
            const container = await DockerContainer
                .findOne({ _id: req.params.id, user: user._id })
                .select('storagePath')
                .lean();
            storagePath = container?.storagePath;
        }
        const requestedPath = path.join(storagePath || '', req.params.route || '');
        if(!fs.existsSync(requestedPath)){
            throw next(new RuntimeError('DockerFS::Container::File::NotExists', 404));
        }
        return requestedPath;
    };

    storageExplorer = catchAsync(async (req: IRequest, res: Response, next: NextFunction) => {
        const requestedPath = await this.getRequestedPath(req, next);
        const files = fs.readdirSync(requestedPath).map((file) => ({
            name: file,
            isDirectory: fs.statSync(path.join(requestedPath, file)).isDirectory()
        }));
        res.status(200).json({ status: 'success', data: files });
    });

    updateContainerFile = catchAsync(async (req: IRequest, res: Response, next: NextFunction) => {
        const requestedPath = await this.getRequestedPath(req, next);
        if(!req.body.content){
            return next(new RuntimeError('Docker::Container::File::UpdateContentRequired', 400));
        }
        fs.writeFileSync(requestedPath, req.body.content, 'utf-8');
        res.status(200).json({ status: 'success' });
    });

    readContainerFile = catchAsync(async (req: IRequest, res: Response, next: NextFunction) => {
        const requestedPath = await this.getRequestedPath(req, next);
        const name = path.basename(requestedPath);
        const content = fs.readFileSync(requestedPath, 'utf-8');
        res.status(200).json({
            status: 'success',
            data: { name, content }
        });
    });
};

export default DockerFS;