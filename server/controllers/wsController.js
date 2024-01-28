const { getUserByToken } = require('@middlewares/authentication');
const RuntimeError = require('@utilities/runtimeError');
const Repository = require('@models/repository');
const PTYHandler = require('@utilities/ptyHandler');
const CloudConsoleHandler = require('@utilities/cloudConsoleHandler');

const userAuthentication = async (socket, next) => {
    const { token } = socket.handshake.auth;
    if(!token) return next(new RuntimeError('Authentication::Token::Required'));
    const user = await getUserByToken(token);
    socket.user = user;
    next();
};

const tokenOwnership = async (socket, next) => {
    const { repositoryName } = socket.handshake.query;
    if(!repositoryName) return next(new RuntimeError('Repository::Name::Required'));
    const repository = await Repository.findOne({ name: repositoryName, user: socket.user._id });
    if(!repository) return next(new RuntimeError('Repository::NotFound'));
    socket.repository = repository;
    next();
};

const repositoryShellHandler = (socket) => {
    const { repository, user } = socket;
    repository.user = user;
    const PTY = new PTYHandler(repository._id, repository);
    const shell = PTY.getOrCreate();

    socket.emit('history', PTY.getLog());

    socket.on('command', (command) => {
        shell.write(command);
    });

    shell.on('data', (data) => {
        data = data.replace(/.*#/g, PTY.getPrompt());
        PTY.appendLog(data);
        socket.emit('response', data);
    });

    shell.on('exit', () => {
        socket.disconnect();
    });
};

const cloudConsoleHandler = (socket) => {
    const { user } = socket;
    const PTY = new CloudConsoleHandler(user._id);
    const shell = PTY.getOrCreate();

    socket.emit('history', PTY.getLog());

    socket.on('command', (command) => {
        shell.write(command);
    });

    shell.on('data', (data) => {
        PTY.appendLog(data);
        socket.emit('response', data);
    });

    shell.on('exit', () => {
        socket.disconnect();
    });
};

module.exports = (io) => {
    io.use(userAuthentication);
    io.on('connection', async (socket) => {
        const { action } = socket.handshake.query;
        if(action === 'Repository::Shell'){
            await tokenOwnership(socket, (err) => {
                if(err) socket.disconnect();
                else repositoryShellHandler(socket);
            });
        }else if(action === 'Cloud::Console'){
            cloudConsoleHandler(socket);
        }else{
            socket.disconnect();
        }
    });
};