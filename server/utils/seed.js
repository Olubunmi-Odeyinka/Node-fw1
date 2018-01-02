var {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');


const userOneId =  new ObjectID();
const userTwoId =  new ObjectID();

const sampleUser = [
    {
        _id: userOneId,
        fullname: "Odeyinka Olubunmi",
        email: 'odeyinkao@yahoo.com',
        password: 'passwordOne',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userOneId, access: 'auth'}, 'my_salt').toString()
        }]
    },
    {
        _id: userTwoId,
        fullname: "Baba Ode",
        email: 'babaode@yahoo.com',
        password: 'passwordTwo',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userTwoId, access:'auth'}, 'my_salt').toString()
        }]
    }
];

module.exports = {sampleUser};