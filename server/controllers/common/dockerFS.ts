import { IRequest } from '@typings/controllers/common'
import { catchAsync } from '@utilities/helpers';
import { NextFunction, Response } from 'express';
import DockerContainer from '@models/docker/container';
import DockerContainerService from '@services/docker/container';
import RuntimeError from '@utilities/runtimeError';
import path from 'path';

class DockerFS{
    private async getContainerService(req: IRequest, next: NextFunction): Promise<DockerContainerService>{
        const user = req.user;
        const container = await DockerContainer.findOne({ _id: req.params.id, user: user._id });
        if(!container){
            throw next(new RuntimeError('Docker::Container::NotFound', 404));
        }
        const containerService = new DockerContainerService(container);
        return containerService;
    };

    storageExplorer = catchAsync(async (req: IRequest, res: Response, next: NextFunction) => {
        const containerService = await this.getContainerService(req, next);
        const files = await containerService.listDirectory(req.params.route);
        res.status(200).json({ status: 'success', data: files });
    });

    updateContainerFile = catchAsync(async (req: IRequest, res: Response, next: NextFunction) => {
        const containerService = await this.getContainerService(req, next);
        try{
            if(!req.body.content){
                return next(new RuntimeError('Docker::Container::File::UpdateContentRequired', 400));
            }
            await containerService.writeFile(req.params.route, req.body.content);
        }catch(error){
            console.log(error);
        }
        res.status(200).json({ status: 'success' });
    });

    readContainerFile = catchAsync(async (req: IRequest, res: Response, next: NextFunction) => {
        const containerService = await this.getContainerService(req, next);
        const name = path.basename(req.params.route);
        const content = await containerService.readFile(req.params.route);
        res.status(200).json({
            status: 'success',
            data: { name, content }
        });
    });
};

export default DockerFS;