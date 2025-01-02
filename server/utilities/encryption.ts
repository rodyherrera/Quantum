import crypto from 'crypto';

// TODO: use process.env.ENCRYPTION_KEY! 
//       and process.env.ENCRYPTION_IV!
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
const IV = Buffer.from(process.env.ENCRYPTION_IV || '', 'hex');

export const encrypt = (text: string): String => {
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

export const decrypt = (encryptedText: string): String => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};