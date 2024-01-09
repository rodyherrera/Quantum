const { getUserByToken } = require('../middlewares/authentication');
const RuntimeError = require('../utilities/runtimeError');
const Repository = require('../models/repository');
const Github = require('../utilities/github');

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
    const prompt = `\x1b[1;92m${user.username}\x1b[0m@\x1b[1;94m${repository.name}:~$\x1b[0m `;
    let commandInProgress = '';
    const shell = Github.getRepositoryPTYOrCreate(repository._id);

    socket.emit('history', Github.getPTYLog(repository._id));

    socket.on('command', (command) => {
        shell.write(command);
        commandInProgress += command;
    });

    shell.on('data', (data) => {
        if(data.includes(`/repositories/${repository._id}/`) || data.includes('bash-5.0$'))
            data = prompt;
        if(data.includes(commandInProgress))
            Github.concatPTYLog(repository._id, data.replace(commandInProgress, ''));
        socket.emit('response', data);
    });

    socket.on('exit', () => {
        shell.kill();
        Github.clearRuntimePTYLog(repository._id);
    });
};

module.exports = (io) => {
    io.use(authenticateSocket);
    io.on('connection', (socket) => {
        handleRepositoryShell(socket);
    });
};