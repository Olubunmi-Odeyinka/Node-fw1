"use strict";
const {mongoose} = require('../../utils/mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    fullname:{
        type: String,
        required: true,
        minlengh: 1,
        trim: true
    },
    email:{
        type: String,
        required: true,
        minlengh: 1,
        trim: true,
        unique: true,
        validator: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password:{
        type: String,
        required: true,
        minlengh: 6,
        trim: true
    },
    tokens:[{
        access:{
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
})

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'my_salt').toString();

    user.tokens.push({access, token});

    return user.save().then(()=>{
        return token;
    });
};

//This control the number of field exposed by json
UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'fullname']);
};

//This is used to add a function removeToken to the User Schema
UserSchema.statics.removeToken = function (token) {
    var user = this;
    return user.update({ },
        {$pull:{
            tokens: {token}
        }},
        { multi: true }
    );
}

UserSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded;

    try{
        decoded = jwt.verify(token, 'my_salt');

    }catch(e){
        return new Promise(function (resolve, reject) {
            reject();
        });
    }

    return User.findOne({
         _id: decoded._id,//user id equal the id field of decoded token
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;

    return User.findOne({email}).then((user) =>{
        if(!user){
            return new Promise(function (resolve, reject) {
                reject();
            });
        }

        return new Promise((resolve, reject) =>{
            bcrypt.compare(password, user.password, (err, res) =>{
                if(res){
                    resolve(user);
                }else  {
                    //Todo:
                    reject();
                }
            })
        })
    })
}

UserSchema.pre('save', function (next) {
    var user = this;

    if(user.isModified('password')){
        bcrypt.genSalt(10, (err, salt) =>{
            bcrypt.hash(user.password, salt, (err, hash) =>{
                user.password = hash;
                next();
            });
        });
    }else {
        next();
    }
});

var User = mongoose.model('Users', UserSchema);

module.exports = {User};