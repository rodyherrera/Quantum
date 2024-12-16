/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

import { catchAsync } from '@utilities/helpers';
import Github from '@models/github';
import HandlerFactory from '@controllers/common/handlerFactory';
import { Request, Response } from 'express';

const GithubFactory = new HandlerFactory({
    model: Github,
    fields: [
        'user',
        'githubId',
        'accessToken',
        'username',
        'avatarUrl'
    ]
});

export const getAccounts = GithubFactory.getAll();
export const getAccount = GithubFactory.getOne();
export const createAccount = GithubFactory.createOne();
export const updateAccount = GithubFactory.updateOne();
export const deleteAccount = GithubFactory.deleteOne();

export const authCallback = catchAsync(async (req: Request, res: Response) => {
    const { accessToken, profile } = req.user as any;
    const { id, username, _json } = profile;
    const { avatar_url } = _json;
    const data = { id, username, avatar_url };
    // res.redirect just dont work... ???
    res.writeHead(302, {
        'Location': `${process.env.CLIENT_HOST}/github/authenticate/?accessToken=${accessToken}&data=${JSON.stringify(data)}`
    });
    res.end();
});