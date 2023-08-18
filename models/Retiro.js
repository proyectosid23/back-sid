const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    monto: { type: Number, required: true },
    fecha: { type: Date, required: true },
    idUser: { type: mongoose.Types.ObjectId, ref: 'users', required: true},
    direccion: { type: String, required: true },
    red: {type: String, required: true},
    estado: {type: String, required: true},
    fechaAprobacion: {type: Date, required: false},
    fechaRechazo: {type: Date, required: false},
    fotoComprobante: {type: String, required: false},
    idAdmin: {type: mongoose.Types.ObjectId, ref: 'users', required: false},
});

const Retiro = mongoose.model('retiros', schema);
module.exports = Retiro;