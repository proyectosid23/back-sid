const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    direccion: {
        type: String,
        required: true,
    },
    direccionBanColombia: {
        type: Number,
    },
    red: {
        type: String,
        required: true,
    },
    userModificate: { 
        type: mongoose.Types.ObjectId, 
        ref: 'users', 
        required: false 
    },
    gananciaDiaria: {
        type: Number,
        required: true,
    },
    ganancia25dias: {
        type: Number,
        required: true,
    },
    ganancia50dias: {
        type: Number,
        required: true,
    },
    ganancia75dias: {
        type: Number,
        required: true,
    },
    gananciaTotal: {
        type: Number,
        required: true,
    },
    valorPC: {
        type: Number,
    }
});


const Plan = mongoose.model('Plan', schema);

module.exports = Plan;