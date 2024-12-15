import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
    // 15 minutes
    windowMs: 15 * 60 * 1000,
    // 100 requests per ip
    max: 100,
    message: 'Core::RateLimiter',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: async (req): Promise<string> => {
        return req.ip as string;
    }
});

export default authLimiter;