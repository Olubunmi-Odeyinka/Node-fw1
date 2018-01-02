"use strict";

var router = require("express").Router();
var {Location} = require('./location.model');
var {ObjectID} = require('mongodb');
var _ = require('lodash');

// router.use(function(req, res, next) {
//     console.log('here in use location');
//     console.log(req.baseUrl);
//     next();
// });

router.get('/:id', (req, res, next) =>{
    var id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    Location.findById(id).then((location) =>{
        if(!location){
            return res.status(404).send();
        }
        res.send({location});
            }).catch((e) =>{
            res.status(400).send()
        });
})

router.get('/', (req, res, next) => {
    var query = {};

    if(req.params.name) {
        query.name = {'$regex': req.params.name, '$options': 'i'};
    }
    if(req.params.state){
        query.state = req.params.state
    }
    if(req.params.area){
        query.area = req.params.area
    }
    if(req.params.subarea){
        query.subarea = req.params.subarea
    }

    var retQuery = Location.find(query);

    if(req.query.t){
        retQuery.limit(req.query.t * 1);
    }

    retQuery.then((data) =>{
        Location.count(query).then((count) =>{
            res.send({
                data,
                count
            })
        })
      },(e) =>{
        res.status(400).send(e);
    });
});

router.post('/', (req, res, next)=>{

    var body = _.pick(req.body, ['name', 'state', 'area', 'subarea']);
    var location = new Location(body);

    location.save().then((newlocation) => {
        res.send(newlocation)
    }, (e) => {
        res.status(400).send(e);
    })
})

router.patch('/:id', (req,res) =>{
    var id = req.params.id;

    var body = _.pick(req.body, ['name' , 'state', 'area'])

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    Location.findByIdAndUpdate(id, {$set: body}, {new: true}).then((location) =>{
        if(!location){
            return res.status(404).send();
        }
        res.send({location});
    }).catch((e) =>{
        res.status(400).send()
    });
})

router.delete('/:id', (req, res, next) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    Location.findByIdAndRemove(id).then((location) =>{
        if(!location){
            return res.status(404).send();
        }
        res.send({location});
       }).catch((e) =>{
        res.status(400).send()
    });
})

module.exports = router;