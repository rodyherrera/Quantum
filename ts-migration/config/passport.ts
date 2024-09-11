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

import passport from 'passport';
import { Strategy as GithubStrategy } from 'passport-github';
import * as dotenv from 'dotenv';

dotenv.config({ path: './.env' });

passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: `${process.env.DOMAIN}/api/v1/github/callback/`,
    scope: ['user', 'repo']
},(accessToken:string,refreshToken:string,profile:any,cb:(err:any,user:any)=>void)=>{
    return cb(null,{accessToken,profile,refreshToken});
}));

passport.serializeUser((user:any,cb:(err:any,identifier:any)=>void)=>{
    cb(null,user);
});

passport.deserializeUser((obj:any,cb:(err:any,user:any)=>void)=>{
    cb(null,obj);
});

export default passport;
