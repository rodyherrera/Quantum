const RuntimeError = require('../utilities/runtimeError');
const { getUserByToken } = require('../middlewares/authentication');

module.exports = (io) => {
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if(!token){
            return next(new RuntimeError('Authentication::Required', 401));
        }
        const user = await getUserByToken(token);
        socket.user = user;
        next();
    });

    io.on('connection', (socket) => {
        console.log('connection');
    });
};