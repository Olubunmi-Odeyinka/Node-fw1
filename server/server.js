require('./utils/config');

const {mongoose} = require('./utils/mongoose');
const app = require('express')();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());


app.use('/locations', require('./module/location/location'));
app.use('/users', require('./module/user/user'));
app.use('/todoes', require('./module/todo/todo'));


app.get('/', (req, res) => { res.send('hello world'); });



    app.get('/person', (req, res) => {
        res.send({
        name: 'Baba',
        likes:[
            'Eating',
            'Drinking'
        ]
    });
});



app.listen(process.env.port, () =>{
    console.log('servere is up on port 8080')
});

module.exports.app = app;
