import { Schema, model } from 'mongoose';
import validator from 'validator';
import bcryptjs from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import { DefaultFeatures } from '../data/FeaturesList.js';
import { addDays } from 'date-fns';

const userSchema = new Schema(
    {
        name: { type: String, required: [true, 'Please tell us your name'] },
        email: {
            type: String,
            required: [true, 'Please provide us with your email'],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Please tell us your Password'],
            minlength: 8,
            select: false,
        },
        ice: {
            type: String,
        },
        if: {
            type: String,
        },
        patente: {
            type: String,
        },
        rc: {
            type: String,
        },
        cnss: {
            type: String,
        },
        rib: {
            type: String,
        },
        tel: {
            type: String,
        },
        address: {
            type: String,
        },
        mainColor: {
            type: String,
            default: '#161D6F',
        },
        secondColor: {
            type: String,
            default: '#98DED9',
        },
        logo: {
            type: String,
            default: '/defaultUser.png',
        },
        passwordConfirm: {
            type: String,
            required: [true, 'Please confirm your Password'],
            validate: {
                validator: function (el) {
                    return el === this.password;
                },
                message: 'Passwords are not the same',
            },
        },
        passwordChangedAt: Date,
        passwordResetToken: {
            type: String,
            select: false,
        },
        passwordResetExpires: Date,
        features: {
            type: [String],
            default: DefaultFeatures,
        },
        licenseExpire: {
            type: Date,
            default: () => addDays(new Date(), 7),
        },

        active: {
            type: Boolean,
            default: true,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        console.log(this.password);
        this.password = await bcryptjs.hash(this.password, 12);
        console.log(this.password);
        this.passwordConfirm = undefined;
    }
    next();
});

userSchema.pre('save', function (next) {
    if (this.isModified('password') && !this.isNew) {
        this.passwordChangedAt = Date.now() - 1000;
    }
    next();
});

userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcryptjs.compare(candidatePassword, userPassword);
};

userSchema.pre(/^find/, function (next) {
    this.find({ active: true });
    next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimesStamp) {
    if (this.passwordChangedAt) {
        const changedTimesStamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimesStamp < changedTimesStamp;
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = randomBytes(32).toString('hex');
    this.passwordResetToken = createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

const User = model('User', userSchema);

export default User;
