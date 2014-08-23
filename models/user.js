var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    local: {
        email: String,
        password: String
    },
    role: {
        type: String,
        default: 'writer'
    },
    firstName: String,
    lastName: String,
    created: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
});

userSchema.virtual('fullName').get(function() {
    return this.firstName + ' ' + this.lastName;
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.set('toObject', { virtuals: true });

userSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, res) {
        delete res._id;
        delete res.__v;
        delete res.local;
        return res;
    }
});

module.exports = mongoose.model('User', userSchema);