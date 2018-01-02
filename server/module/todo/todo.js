"use strict";

var router = require("express").Router();
var {Todo} = require('./todo.model');
var {ObjectID} = require('mongodb');
var _ = require('lodash');


var {authenticate} = require('../../utils/authenticate');

// router.use(function(req, res, next) {
//     console.log('here in use location');
//     console.log(req.baseUrl);
//     next();
// });

router.get('/:id', authenticate, (req, res, next) =>{
    var id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    var query = {_id: id, _creator: req.user._id};

    query._creator = req.user._id;

    Todo.findOne(query).then((todo) =>{
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e) =>{
        res.status(400).send()
    });
})

router.get('/', authenticate, (req, res, next) => {
    var query = {_creator : req.user._id};
    if(req.params.text) {
        query.text = {'$regex': req.params.text, '$options': 'i'};
    }
    if(req.params.completed){
        query.completed = req.params.completed
    }

    Todo.find(query).then((todoes) =>{
        res.send({
            todoes
        })
    },(e) =>{
        res.status(400).send(e);
    });
});

router.post('/', authenticate, (req, res, next)=>{

    var body = _.pick(req.body, ['text', 'completed', 'completedAt']);
    body._creator = req.user._id;
    var todo = new Todo(body);
    todo.save().then((newtodo) => {
        res.send(newtodo)
    }, (e) => {
        console.log("Got to error called");
        res.status(400).send(e);
    })
})

router.patch('/:id', authenticate, (req,res) =>{
    var id = req.params.id;

    var body = _.pick(req.body, ['text', 'completed', 'completedAt'])

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    var query = {_id: id, _creator: req.user._id};

    Todo.findOneAndUpdate(query, {$set: body}, {new: true}).then((todo) =>{
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e) =>{
        res.status(400).send()
    });
})

router.delete('/:id', authenticate, (req, res, next) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    var query = {_id: id, _creator: req.user._id};

    Todo.findOneAndRemove(query).then((todo) =>{
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e) =>{
        res.status(400).send()
    });
})

module.exports = router;