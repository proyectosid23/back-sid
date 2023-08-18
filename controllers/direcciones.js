const Direccion = require('../models/Direccion');

const controller = {

    crearDireccion: async (req, res, next) => {

        const { id, role } = req.user
        const { plan, direccion } = req.body

        if(role !== 'admin') {

            return res.status(200).json({
                success: false,
                response: null,
                message: `No tienes permisos para crear una direccion`
            })
        }

        const direccionCreada = await Direccion.create({ plan: plan, direccion: direccion, userModificate: id })

        if (!direccionCreada) {
            return res.status(200).json({
                success: false,
                response: null,
                message: `No se pudo crear la direccion`
            })
        }

        return res.status(200).json({
            success: true,
            response: direccionCreada,
            message: `Direccion creada`
        })
    },

    obtenerDireccion: async (req, res, next) => {

        const { role } = req.user
        const { plan } = req.body

        if(role !== 'admin') {

            return res.status(200).json({
                success: false,
                response: null,
                message: `No tienes permisos para obtener una direccion`
            })
        }

        const direccion = await Direccion.findOne({ plan: plan})

        if (!direccion) {
            return res.status(200).json({
                success: false,
                response: null,
                message: `No se encontro la direccion`
            })
        }

        return res.status(200).json({
            success: true,
            response: direccion,
            message: `Direccion encontrada`
        })
    },

    actualizarDireccion: async (req, res, next) => {

        const { id, role } = req.user
        const { plan, direccion } = req.body

        if(role !== 'admin') {

            return res.status(200).json({
                success: false,
                response: null,
                message: `No tienes permisos para actualizar una direccion`
            })
        }

        const direccionActualizada = await Direccion.findOneAndUpdate({ plan: plan }, { direccion: direccion, userModificate: id }, { new: true })

        if (!direccionActualizada) {
            return res.status(200).json({
                success: false,
                response: null,
                message: `No se pudo actualizar la direccion`
            })
        }

        return res.status(200).json({
            success: true,
            response: direccionActualizada,
            message: `Direccion actualizada`
        })
    },
}

module.exports = controller;