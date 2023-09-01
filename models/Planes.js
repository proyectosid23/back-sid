const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    plan: { type: Number, required: true },
    estado: { type: String, required: true },
    capturaDePago: { type: String, required: true },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true },
    TxId: { type: String, required: true },
    monto: { type: Number, required: true },
    montoTotal: { type: Number, required: true },
    porcentajeDiario: { type: Number, required: true },
    acumulado: { type: Number, required: true },
    userBuy: {
        id: { type: mongoose.Types.ObjectId, ref: 'users', required: true },
        name: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
    },
    idAdmin: { type: mongoose.Types.ObjectId, ref: 'users', required: false },
    completo: { type: Boolean, required: true },
    fantasma: { type: Boolean, required: true },
});

const Planes = mongoose.model('planes', schema);
module.exports = Planes;


