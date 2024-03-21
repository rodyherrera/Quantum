const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_AUTH_USER,
        pass: process.env.SMTP_AUTH_PASSWORD
    },
    tls: { rejectUnauthorized: false }
});

exports.sendMail = async ({ to = process.env.WEBMASTER_MAIL, subject, html }) => {
    try{
        await transporter.sendMail({
            from: `Quantum Cloud Platform <${process.env.SMTP_AUTH_USER}>`,
            to,
            subject,
            html
        });
    }catch(error){
        console.error('[Quantum Cloud] (at @utilities/mailHandler - sendMail):', error);
    }
};

module.exports = exports;