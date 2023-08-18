const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    role: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    codReferido: { type: String, required: true },
    codReferir: { type: String, required: true },
    code: { type: String, required: true },
    verified: { type: Boolean, required: true },
    logged: { type: Boolean, required: true },
    planes: { type: Array},
    fechaInicio: { type: Date},
    fechaFin: { type: Date},
    historialRetiros: { type: Array},
    referidos: { type: Array},
    saldoActual: { type: Number, required: true },
});

const User = mongoose.model('users', schema);
module.exports = User;