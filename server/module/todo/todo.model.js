const {mongoose} = require('../../utils/mongoose');
const validator = require('validator');

var Todo = mongoose.model('Todoes',{
    text:{
        type: String,
        required: true,
        minlengh: 1,
        trim: true
    },
    completed:{
        type: Boolean,
        required: false
    },
    completedAt:{
        type: Number,
        default: null
    },
    _creator:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

module.exports = {Todo};