const request = require('supertest');
const expect  = require('expect');

var app = require('./server').app;

describe('express test', () => {

it('should return hello world response', (done) => {
   request(app)
    .get('/')
    .expect(200)
    .expect("hello world")
    .end(done);

    //.expect(404)
});

it('should return json to include a name: baba ', (done) => {
    request(app)
    .get('/person')
    .expect(200)
    .expect({
        name: 'Baba',
        likes:[
            'Eating',
            'Drinking'
        ]
    })
    .end(done);
});

it('should return json from server ', (done) => {
    request(app)
    .get('/person')
    .expect(200)
    .expect((res) => {
    expect(res.body).toInclude({name: 'Baba'});
})
.end(done);

});
});