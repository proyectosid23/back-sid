const Retiro = require("../models/Retiro");
const { tieneRetiroPendiente } = require("../config/responses");

async function RetiroEnEspera(req, res, next) {
    let id = req.user.id
    const retiro = await Retiro.find({idUser: id})
    const retiroPendiente = retiro.some(retiro => retiro.estado === 'Pendiente')
    if (retiroPendiente) {
        return tieneRetiroPendiente(req,res)
    }
    return next()
}

module.exports = RetiroEnEspera