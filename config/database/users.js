let users = [
    {
        "role": "user",
        "email": "aleedario1995@gmail.com",
        "password": "aleedario1995",
        "name": "Alejandro",
        "lastName": "Sanchez",
        "codReferido": 1,
        "codReferir": 2,
        "code": "123456",
        "verified": true,
        "logged": true,
        "planActual": "",
        "fechaInicio": "",
        "fechaFin": "",
        "historialRetiros": [],
        "referidos": [],
        "saldoActual": 0
    },

]

require('dotenv').config();
require('../database');
const User = require('../../models/User');

users.forEach(elemento => {
    User.create({
        role: elemento.role,
        email: elemento.email,
        password: elemento.password,
        name: elemento.name,
        lastName: elemento.lastName,
        codReferido: elemento.codReferido,
        codReferir: elemento.codReferir,
        code: elemento.code,
        verified: elemento.verified,
        logged: elemento.logged,
        planActual: elemento.planActual,
        fechaInicio: elemento.fechaInicio,
        fechaFin: elemento.fechaFin,
        historialRetiros: elemento.historialRetiros,
        referidos: elemento.referidos,
        saldoActual: elemento.saldoActual
    })
})