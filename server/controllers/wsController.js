const RuntimeError = require('../utilities/runtimeError');
const { getUserByToken } = require('../middlewares/authentication');
const Repository = require('../models/repository');
const { exec } = require('child_process');

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

const handleCommand = async (command, callback, socket) => {
    const { repository } = socket;
    const workingDir = `${__dirname}/../storage/repositories/${repository._id}/`;
    exec(command, { cwd: workingDir }, (error, stdout, stderr) => {
        let response = '';
        if(stdout) response = stdout;
        if(stderr) response = stderr;
        if(error) response = error.message;
        // Sometimes, "stderr" can be a object!
        if(typeof response === 'object') response = stderr.cmd;
        callback(response);
    });
};

module.exports = (io) => {
    io.use(authenticateSocket);
    io.on('connection', (socket) => {
        socket.on('command', (command, callback) => handleCommand(command, callback, socket));
    });
};