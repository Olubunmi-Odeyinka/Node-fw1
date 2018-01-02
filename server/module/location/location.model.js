var {mongoose} = require('../../utils/mongoose');

var Location = mongoose.model('Locations',{
    name:{
        type: String,
        required: true,
        minlengh: 1,
        trim: true
    },
    state:{
        type: Number,
        required: true,
        default: null
    },
    area:{
        type: Number,
        required: true,
        default: null
    },
    subarea:{
        type: Number,
        required: true,
        default: null
    }
});

module.exports = {Location};