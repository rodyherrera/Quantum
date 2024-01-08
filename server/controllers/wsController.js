const { getUserByToken } = require('../middlewares/authentication');
const RuntimeError = require('../utilities/runtimeError');
const Repository = require('../models/repository');
const pty = require('node-pty');

const authenticateSocket = async (socket, next) => {
    const { token } = socket.handshake.auth;
    if(!token) return next(new RuntimeError('Authentication::Token::Required'));
    const user = await getUserByToken(token);
    socket.user = user;

    const { repositoryName } = socket.handshake.query;
    if(!repositoryName) return next(new RuntimeError('Repository::Name::Required'));
    const repository = await Repository.findOne({ name: repositoryName, user: user._id });
    if(!repository) return next(new RuntimeError('Repository::NotFound'));
    socket.repository = repository;

    next();
};

const handleRepositoryShell = (socket) => {
    const { repository } = socket;
    const shell = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: `${__dirname}/../storage/repositories/${repository._id}/`,
        env: process.env
    });

    socket.on('command', (command) => {
        shell.write(command);
    });

    shell.on('data', (data) => {
        socket.emit('response', data);
    });

    socket.on('exit', () => {
        shell.kill();
    });
};

module.exports = (io) => {
    io.use(authenticateSocket);
    io.on('connection', (socket) => {
        handleRepositoryShell(socket);
    });
};