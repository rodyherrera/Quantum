const jwt = require('jsonwebtoken');
const User = require('@models/user');
const HandlerFactory = require('@controllers/handlerFactory');
const { catchAsync, filterObject } = require('@utilities/runtime');

const UserFactory = new HandlerFactory({
    model: User,
    fields: [
        'username',
        'fullname',
        'github',
        'email',
        'password',
        'passwordConfirm',
    ]
});

const signToken = (identifier) => {
    return jwt.sign({ id: identifier }, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRATION_DAYS
    })
};

const createAndSendToken = (res, statusCode, user) => {
    const token = signToken(user._id);
    user.password = undefined;
    user.__v = undefined;
    res.status(statusCode).json({
        status: 'success',
        data: { token, user }
    });
};

exports.signIn = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if(!email || !password){
        return next(new Error('Authentication::EmailOrPasswordRequired'));
    }
    const requestedUser = await User.findOne({ email }).select('+password').populate('github');
    if(!requestedUser || !(await requestedUser.isCorrectPassword(password, requestedUser.password))){
        return next(new Error('Authentication::EmailOrPasswordIncorrect', 401));
    }
    createAndSendToken(res, 200, requestedUser);
});

exports.signUp = catchAsync(async (req, res, next) => {
    const { username, fullname, email, password, passwordConfirm } = req.body;
    if(process.env.REGISTRATION_DISABLED === 'true'){
        return next(new Error('Authentication::Disabled'));
    }
    const newUser = await User.create({ username, fullname, email, password, passwordConfirm });
    createAndSendToken(res, 201, newUser);
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
    const requestedUser = await User.findById(req.user.id).select('+password');
    if(!(await requestedUser.isCorrectPassword(req.body.passwordCurrent, requestedUser.password))){
        return next(new Error('Authentication::Update::PasswordCurrentIncorrect'));
    }
    requestedUser.password = req.body.password;
    requestedUser.passwordConfirm = req.body.passwordConfirm;
    await requestedUser.save();
    createAndSendToken(res, 200, requestedUser);
});

exports.deleteMyAccount = catchAsync(async (req, res, next) => {
    const requestedUser = await User.findByIdAndDelete(req.user.id);
    if(!requestedUser){
        return next(new Error('Authentication::Delete::UserNotFound'));
    }
    res.status(204).json({
        status: 'success',
        data: requestedUser
    });
});

exports.getMyAccount = catchAsync(async (req, res, next) => {
    const requestedUser = await User.findById(req.user.id).populate('github');
    if(!requestedUser){
        return next(new Error('Authentication::Get::UserNotFound'));
    }
    res.status(200).json({
        status: 'success',
        data: requestedUser
    });
});

exports.updateMyAccount = catchAsync(async (req, res, next) => {
    const filteredBody = filterObject(req.body, 'username', 'fullname', 'email');
    const requestedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });
    if(!requestedUser){
        return next(new Error('Authentication::Update::UserNotFound'));
    }
    res.status(200).json({
        status: 'success',
        data: requestedUser
    });
});

exports.deleteUser = UserFactory.deleteOne();
exports.getUser = UserFactory.getOne();
exports.getAllUsers = UserFactory.getAll();
exports.updateUser = UserFactory.updateOne();
exports.createUser = UserFactory.createOne();

module.exports = exports;