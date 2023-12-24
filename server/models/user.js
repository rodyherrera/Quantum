const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const TextSearch = require('mongoose-partial-search');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: [8, 'User::Username::Minlength'],
        maxlength: [16, 'User::Username::Maxlength'],
        required: [true, 'User::Username::Required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    github: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Github'
    },
    fullname: {
        type: String,
        minlength: [8, 'User::Fullname::Minlength'],
        maxlength: [32, 'User::Fullname::Maxlength'],
        required: [true, 'User::Fullname::Required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'User::Email::Required'],
        unique: [true, 'User::Email::Unique'],
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'User::Email::Validate']
    },
    password: {
        type: String,
        required: [true, 'User::Password::Required'],
        minlength: [8, 'User::Password::Minlength'],
        maxlength: [16, 'User::Password::Maxlength'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'User::PasswordConfirm::Required'],
        validate: {
            validator: function(v){
                return v === this.password;
            },
            message: 'User::PasswordConfirm::Validate'
        }
    },
    role: {
        type: String,
        lowercase: true,
        enum: ['user', 'admin'],
        default: 'user'
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

UserSchema.plugin(TextSearch);
UserSchema.index({ username: 'text', fullname: 'text', email: 'text' });

UserSchema.pre('save', async function(next){
    if(!this.isModified('password'))
        return next();
    this.username = this.username.replace(/\s/g, '');
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
});

UserSchema.pre('remove', async function(next) {
    await mongoose.model('Github').findOneAndRemove({ user: this._id });
    next();
});

UserSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew)
        return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

UserSchema.methods.isCorrectPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.isPasswordChangedAfterJWFWasIssued = function(JWTTimeStamp){
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimeStamp < changedTimeStamp;
    }
    return false;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;