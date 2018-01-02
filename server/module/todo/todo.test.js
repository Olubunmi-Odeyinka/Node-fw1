"use strict";
const expect = require('expect');
const request = require('supertest');
var {ObjectID} = require('mongodb');

const {app} = require('../../server');
const {Todo} = require('./todo.model');
const {sampleUser} = require('../../utils/seed');

 const userOneId = sampleUser[0]._id.toHexString();
 const userTwoId = sampleUser[1]._id.toHexString();
const sampleTodo = [
    {
        _id: new ObjectID(),
        text: "First Tod",
        _creator: userOneId,
    },
    {
        _id: new ObjectID(),
        text: "Second Todo",
        completed: true,
        completedAt: 333,
        _creator: userTwoId,
    }
];


beforeEach((done) =>{
    Todo.remove({}).then(() => {
        return Todo.insertMany(sampleTodo);
    }).then(() => done());

});

describe('POST /todoes', () => {
    it('should create a new todo', (done) => {
        var testTodoData = {
            text: "Third Todo"
        };

        request(app)
            .post('/todoes')
            .set('x-auth', sampleUser[0].tokens[0].token)
            .send(testTodoData)
            .expect(200)
            .expect((res)=>{
                expect(res.body.text).toBe(testTodoData.text)
            }).end((err, res) => {
            if(err){
                return done(err);
            }

            console.log(res.body.text);
            Todo.find({text : testTodoData.text}).then((todoes) => {
                expect(todoes.length).toBe(1);
                expect(todoes[0].text).toBe(testTodoData.text);
                done();
            }).catch((e) => done(e));
        });
    });

    it('should not create a todo with invalid data', (done) => {
        request(app)
            .post('./todoes')
            .set('x-auth', sampleUser[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res) => {
                if(err){
                    return done(err);
                }

                Todo.find().then((todoes) =>{
                    expect(todoes.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            })
    });
})

describe('Get /todoes', () =>{
    it('should get all todoes', (done)=>{
        Todo.find().then((todoes) =>{
            request(app)
                .get('/todoes')
                .set('x-auth', sampleUser[0].tokens[0].token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.todoes.length).toBe(1);
                })
                .end(done);
        })
    });
})

describe('Get /todoes/:id', () => {

    it('should get todo item', (done) =>{
        request(app)
            .get(`/todoes/${sampleTodo[0]._id.toHexString()}`)
            .set('x-auth', sampleUser[0].tokens[0].token)
            .expect(200)
            .expect((res) =>{
                expect(res.body.todo.text).toBe(sampleTodo[0].text);
            })
            .end(done);
    });

    it('should not return todo item created by other user', (done) =>{
        request(app)
            .get(`/todoes/${sampleTodo[1]._id.toHexString()}`)
            .set('x-auth', sampleUser[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 if todo not found', (done) =>{
        var id = new ObjectID().toHexString();
        request(app)
            .get(`/todoes/${id}`)
            .set('x-auth', sampleUser[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) =>{
        request(app)
            .get("/todoes/59288ff8590f3eb0b304e7")
            .set('x-auth', sampleUser[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todoes/:id', () => {

    it('should update the todo', (done)=>{
        var newText = "changed Todo Text";
        sampleTodo[1].text = newText;
        request(app)
            .patch(`/todoes/${sampleTodo[1]._id.toHexString()}`)
            .set('x-auth', sampleUser[1].tokens[0].token)
            .send(sampleTodo[1])
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(newText);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number')
            }).end(done);
    })

    it('should not update the todo created by other user', (done)=>{
        var newText = "changed Todo Text ";
        sampleTodo[0].text = newText;
        request(app)
            .patch(`/todoes/${sampleTodo[0]._id.toHexString()}`)
            .set('x-auth', sampleUser[1].tokens[0].token)
            .send(sampleTodo[0])
            .expect(404)
            .end(done);
    })

})

describe('DELETE /todoes/:id', () => {

    it('should remove todo item', (done) =>{
        var id = sampleTodo[1]._id.toHexString();
        request(app)
            .delete(`/todoes/${sampleTodo[1]._id.toHexString()}`)
            .set('x-auth', sampleUser[1].tokens[0].token)
            .expect(200)
            .expect((res) =>{
                expect(res.body.todo.text).toBe(sampleTodo[1].text);
            })
            .end((err, res)=>{
                if(err){
                    return done(err);
                }

                Todo.findById(id).then((todo) =>{
                    expect(todo).toNotExist();
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return 404 if todo not found', (done) =>{
        var id = new ObjectID().toHexString();
        request(app)
            .delete(`/todoes/${id}`)
            .set('x-auth', sampleUser[1].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) =>{
        request(app)
            .delete("/todoes/59288ff8590f3eb0b304e7")
            .set('x-auth', sampleUser[1].tokens[0].token)
            .expect(404)
            .end(done);
    });
});
