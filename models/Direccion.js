const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    plan: {
        type: Number,
        required: true
    },
    direccion: {
        type: String,
        required: true
    },
    userModificate: { 
        type: mongoose.Types.ObjectId, 
        ref: 'users', 
        required: false 
    },
});

const Direccion = mongoose.model('Direccion', schema);

module.exports = Direccion;
