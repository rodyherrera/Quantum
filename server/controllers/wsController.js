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
    const { repository, user } = socket;
    const workingDir = `${__dirname}/../storage/repositories/${repository._id}/`;
    const shell = pty.spawn('bash', ['-i'], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: workingDir,
    });

    socket.on('command', (command) => {
        shell.write(command);
    });

    shell.on('data', (data) => {
        if(data.includes(`../storage/repositories/${repository._id}/`)){
            data = `\x1b[1;92m${user.username}\x1b[0m@\x1b[1;94m${repository.name}:~$\x1b[0m `;
        }
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