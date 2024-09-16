const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Use bcrypt for password hashing

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    friendRequests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, {
    timestamps: true
});

// Pre-save hook for hashing password before saving to DB
userSchema.pre('save', async function(next) {
    const user = this;

    // Hash the password if it is modified or new
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }

    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
