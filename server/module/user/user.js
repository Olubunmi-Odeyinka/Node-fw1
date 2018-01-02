"use strict";

var router = require("express").Router();
var {User} = require('./user.model');
var {authenticate} = require('../../utils/authenticate');
var {ObjectID} = require('mongodb');
var _ = require('lodash');


router.get('/', (req, res, next) => {
    var query = {};

    User.find(query).then((users) =>{
        res.send({
            users
        })
      },(e) =>{
            res.status(400).send(e);
        });
});

router.get('/me', authenticate, (req, res)=>{
    res.send(req.user);
});

// router.get('/:id', (req, res, next) =>{
//     var id = req.params.id;
//
//     if(!ObjectID.isValid(id)){
//         return res.status(404).send();
//     }
//
//     User.findById(id).then((user) =>{
//         if(!user){
//             return res.status(404).send();
//         }
//         res.send({user});
//     }).catch((e) =>{
//         res.status(400).send()
//     });
// })

router.post('/login', (req, res, next)=>{
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) =>{
        return user.generateAuthToken().then((token) =>{
            res.header('x-auth', token).send(user);
        })
        res.send(user);
    }).catch((e) =>{
        res.status(400).send();
    });
});

router.delete('/me/token', authenticate, (req, res) =>{
    User.removeToken(req.token).then(() =>{
        res.status(200).send();
    }, ()=>{
        res.status(400).send();
    });
});

router.post('/', (req, res, next)=>{

    var body = _.pick(req.body, ['email', 'fullname', 'password']);
    var user = new User(body);

    user.save().then(() => {
       return  user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    })
});

router.patch('/:id', (req,res) =>{
    var id = req.params.id;

    var body = _.pick(req.body, ['email', 'fullname', 'password'])

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    User.findByIdAndUpdate(id, {$set: body}, {new: true}).then((user) =>{
        if(!user){
            return res.status(404).send();
        }
        res.send({user});
    }).catch((e) =>{
        res.status(400).send()
    });
})

router.delete('/:id', (req, res, next) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    User.findByIdAndRemove(id).then((user) =>{
        if(!user){
            return res.status(404).send();
        }
        res.send({user});
       }).catch((e) =>{
        res.status(400).send();
    });
})

module.exports = router;