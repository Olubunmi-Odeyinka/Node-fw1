"use strict";
const expect = require('expect');
const request = require('supertest');
var {ObjectID} = require('mongodb');

const {app} = require('../../server');
const {User} = require('./user.model');
const jwt = require('jsonwebtoken');
const {sampleUser} = require('../../utils/seed');


beforeEach((done) =>{
    User.remove({}).then(() => {
        var userOne = new User(sampleUser[0]).save();
        var userTwo = new User(sampleUser[1]).save();

        return Promise.all([userOne, userTwo])
    }).then(() => done());
});

describe('POST /users', () => {
    const userId =  new ObjectID();
    var testUserData =  {
        _id: userId,
        fullname: "Odeyinka Omowunmi",
        email: 'omowunmi@yahoo.com',
        password: 'passwordOne'
        // tokens: [{
        //     access: 'auth',
        //     token: jwt.sign({_id: userId, access: 'auth'}, 'my_salt').toString()
        // }]
    };

    it('should create a new user', (done) => {

        request(app)
            .post('/users')
            .send(testUserData)
            .expect(200)
            .expect((res)=>{
             expect(res.headers['x-auth']).toExist();
             expect(res.body._id).toExist();
             expect(res.body.fullname).toBe(testUserData.fullname)
            }).end((err, res) => {
              if(err){
                return done(err);
              }

           User.findOne({email : testUserData.email}).then((user) => {
            expect(user.password).toNotBe(testUserData.password)
            expect(user.fullname).toInclude(testUserData.fullname);
            done();
           }).catch((e) => done(e));
        });
    });

    it('should not create a user with invalid data', (done) => {
        request(app)
            .post('./users')
            .send({})
            .expect(400)
            .end((err, res) => {
              if(err){
                  return done(err);
              }

              User.find().then((users) =>{
                  expect(users.length).toBe(2);
                  done();
                }).catch((e) => done(e));
            })
    })
})

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) =>{
        request(app)
            .post('/users/login')
            .send({
                email: sampleUser[1].email,
                password: sampleUser[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
            })
            .end((err, res)=>{
               if(err){
                   return done(err)
               }

               User.findById(sampleUser[1]._id).then((user) =>{
                    expect(user.tokens[user.tokens.length-1]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                   done()
               }).catch((e) => done(e));
            })
        })

    it('should reject invalid login credentials', (done) =>{
        request(app)
            .post('/users/login')
            .send({
                email: sampleUser[1].email,
                password: sampleUser[1].password +"fff"
            })
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
            })
            .end((err, res)=>{
                if(err){
                    return done(err)
                }

                User.findById(sampleUser[1]._id).then((user) =>{
                    expect(user.tokens.length).toBe(1);
                    done()
                }).catch((e) => done(e));
            })
    })

})

describe('Get /users', () =>{
    it('should get all users', (done)=>{
        User.find().then((users) =>{
            request(app)
                .get('/users')
                .expect(200)
                .expect((res) => {
                  expect(res.body.users.length).toBe(2);
                })
                .end(done);
        })
    });
});

describe('GET /users/me', () =>{
    it('should return user if authernticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', sampleUser[0].tokens[0].token)
            .expect(200)
            .expect((res) =>{
                expect(res.body._id).toBe(sampleUser[0]._id.toHexString());
                expect(res.body.fullname).toBe(sampleUser[0].fullname);
            })
            .end(done)
    })

    it('should return 401 if not authenticated', (done) =>{
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) =>{
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('PATCH /users/:id', () => {
    it('should update the user', (done)=>{
        var newName = "changed name";
        sampleUser[0].fullname = newName;
       request(app)
           .patch(`/users/${sampleUser[0]._id.toHexString()}`)
           .send(sampleUser[0])
           .expect(200)
           .expect((res) => {
              expect(res.body.user.fullname).toBe(newName)
           }).end(done)
    })

    it('should not update subarea in the updated user', (done)=>{

            var newSubArea = 5;

            sampleUser[1].subarea = newSubArea;
            request(app)
                .patch(`/users/${sampleUser[1]._id.toHexString()}`)
                .send(sampleUser[1])
                .expect(200)
                .expect((res) => {
                    expect(res.body.user.subarea).toNotBe(newSubArea)
                }).end(done)
        })

})

describe('DELETE /users/me/token', () =>{
    it('should remove auth token on logout', (done) =>{

        var loginTokens;
        User.findById(sampleUser[1]._id).then((user) =>{
            loginTokens = user.tokens.length;
        request(app)
            .delete(`/users/me/token`)
            .set('x-auth', sampleUser[1].tokens[0].token)
            .expect(200)
            .end((err, res)=>{
                if(err){
                    return done(err);
                }
                User.findById(sampleUser[1]._id).then((user) =>{
                    expect(user.tokens.length).toBe(loginTokens -1);
                    done();
                }).catch((e) => done(e));
            });
        }).catch((e) => done(e));
    });
});

describe('DELETE /users/:id', () => {

    it('should remove user item', (done) =>{
        var id = sampleUser[1]._id.toHexString();
        request(app)
            .delete(`/users/${sampleUser[1]._id.toHexString()}`)
            .expect(200)
            .expect((res) =>{
                expect(res.body.user.fullname).toBe(sampleUser[1].fullname);
            })
            .end((err, res)=>{
              if(err){
                  return done(err);
              }

              User.findById(id).then((user) =>{
                  expect(user).toNotExist();
                  done();
              }).catch((e) => done(e));
            });
    });

    it('should return 404 if user not found', (done) =>{
        var id = new ObjectID().toHexString();
        request(app)
            .delete(`/users/${id}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) =>{
        request(app)
            .delete("/users/59288ff8590f3eb0b304e7")
            .expect(404)
            .end(done);
    });
});
