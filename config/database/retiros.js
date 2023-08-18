let retiros = [
    {
        "monto": "1500",
        "fecha": "06/07/2023",
        "idUser": "64545d8d7821a089a5c6a2f9",
        "token": "a54asd65asd64g6as5d4g",
    },

]

require('dotenv').config();
require('../database');
const Retiro = require('../../models/Retiro');

retiros.forEach(e => {
    Retiro.create({
        monto: e.monto,
        fecha: e.fecha,
        idUser: e.idUser,
        token: e.token,
    })
})