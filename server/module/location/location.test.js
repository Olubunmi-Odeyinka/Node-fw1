"use strict";
const expect = require('expect');
const request = require('supertest');
var {ObjectID} = require('mongodb');

const {app} = require('../../server');
const {Location} = require('./location.model');

const sampleLocation = [
        {
            _id: new ObjectID(),
            name: "Ogunmokun",
            subarea: 2,
            area: 1,
            state: 1
        },
        {
            _id: new ObjectID(),
            name: "This is new",
            subarea: 2,
            area: 1,
            state: 2
        }
    ];


beforeEach((done) =>{
    Location.remove({}).then(() => {
        return Location.insertMany(sampleLocation);
    }).then(() => done());

});

describe('POST /locations', () => {
    it('should create a new location', (done) => {
        var testLocationData = {
            name: 'Uniques Estate',
            state: 2,
            area: 4,
            subarea: 1
        };

        request(app)
            .post('/locations')
            .send(testLocationData)
            .expect(200)
            .expect((res)=>{
             expect(res.body.name).toBe(testLocationData.name)
            }).end((err, res) => {
            if(err){
                return done(err);
              }

           Location.find({name : testLocationData.name}).then((locations) => {
            expect(locations.length).toBe(1);
            expect(locations[0].name).toBe(testLocationData.name);
            done();
           }).catch((e) => done(e));
        })
    })

    it('should not create a location with invalid data', (done) => {
        request(app)
            .post('./locations')
            .send({})
            .expect(400)
            .end((err, res) => {
              if(err){
                  return done(err);
              }

              Location.find().then((locations) =>{
                  expect(locations.length).toBe(2);
                  done();
                }).catch((e) => done(e));
            })
    });
})

describe('Get /locations', () =>{
    it('should get all locations', (done)=>{
        Location.find().then((locations) =>{
            request(app)
                .get('/locations')
                .expect(200)
                .expect((res) => {
                  expect(res.body.data.length).toBe(2);
                })
                .end(done);
        })
    });
})

describe('Get /locations/:id', () => {

    it('should get location item', (done) =>{
        request(app)
            .get(`/locations/${sampleLocation[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) =>{
                expect(res.body.location.name).toBe(sampleLocation[0].name);
            })
            .end(done);
    });

    it('should return 404 if location not found', (done) =>{
        var id = new ObjectID().toHexString();
        request(app)
            .get(`/locations/${id}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) =>{
        request(app)
            .get("/locations/59288ff8590f3eb0b304e7")
            .expect(404)
            .end(done);
    });
});

describe('PATCH /locations/:id', () => {
    it('should update the location', (done)=>{
        var newName = "changed name";
        sampleLocation[0].name = newName;
       request(app)
           .patch(`/locations/${sampleLocation[0]._id.toHexString()}`)
           .send(sampleLocation[0])
           .expect(200)
           .expect((res) => {
                expect(res.body.location.name).toBe(newName)
            })
           .end(done);
    })


    it('should not update the subArea', (done)=>{
            var newSubArea = 5;
            var oldSubArae = sampleLocation[1].subarea;
        sampleLocation[1].subarea = newSubArea;
            request(app)
                .patch(`/locations/${sampleLocation[1]._id.toHexString()}`)
                .send(sampleLocation[1])
                .expect(200)
                .expect((res) => {
                    expect(res.body.location.subarea).toNotBe(newSubArea);
                    expect(res.body.location.subarea).toBe(oldSubArae);

                }).end(done);
        });
})

describe('DELETE /locations/:id', () => {

    it('should remove location item', (done) =>{
        var id = sampleLocation[1]._id.toHexString();
        request(app)
            .delete(`/locations/${sampleLocation[1]._id.toHexString()}`)
            .expect(200)
            .expect((res) =>{
                expect(res.body.location.name).toBe(sampleLocation[1].name);
            })
            .end((err, res)=>{
              if(err){
                  return done(err);
              }

              Location.findById(id).then((location) =>{
                  expect(location).toNotExist();
                  done();
              }).catch((e) => done(e));
            });
    });

    it('should return 404 if location not found', (done) =>{
        var id = new ObjectID().toHexString();
        request(app)
            .delete(`/locations/${id}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) =>{
        request(app)
            .delete("/locations/59288ff8590f3eb0b304e7")
            .expect(404)
            .end(done);
    });
});
