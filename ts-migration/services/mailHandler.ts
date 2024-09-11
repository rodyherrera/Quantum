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

import nodemailer from 'nodemailer';
import { EmailOptions } from '@types/services/emailHandler';

/**
 * Boolean flag indicating whether all the necessary SMTP environment 
 * variables are defined for sending emails.
 * 
 * The required variables are:
 *  * SMTP_HOST
 *  * SMTP_PORT
 *  * SMTP_AUTH_USER
 *  * SMTP_AUTH_PASSWORD
 *  * WEBMASTER_MAIL
 * 
 * @type {boolean} 
*/
const IS_SMTP_DEFINED = (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_AUTH_USER &&
    process.env.SMTP_AUTH_PASSWORD &&
    process.env.WEBMASTER_MAIL
);

/**
 * Creates a mailer transport object using Nodemailer, configured with 
 * environment variables for security and authentication.
*/
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.SMTP_AUTH_USER,
        pass: process.env.SMTP_AUTH_PASSWORD
    },
    tls: { rejectUnauthorized: false }
});

/**
 * Asynchronously sends an email using the preconfigured Nodemailer transporter.

 * @param {EmailOptions} emailOptions - Options for configuring the email.
 * @returns {Promise<void>} A promise that resolves when the email is sent.
 * @throws {Error} If there's an error during the sending process.
*/
export const sendMail = async({ to = process.env.WEBMASTER_MAIL, subject, html }: EmailOptions): Promise<void> => {
    if(!IS_SMTP_DEFINED) return;
    try{
        await transporter.sendMail({
            from: `Quantum Cloud Platform <${process.env.SMTP_AUTH_USER}>`,
            to,
            subject,
            html
        });
    }catch(error){
        console.error('[Quantum Cloud] (at @services/mailHandler - sendMail):', error);
    }
};

export default { sendMail };