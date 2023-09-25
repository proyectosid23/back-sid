const Retiro = require('../models/Retiro');
const User = require('../models/User');

const controller = {

    crear: async (req, res, next) => {
        const { id, saldoActual } = req.user
        const { monto, direccion, red, TxId } = req.body

        if (monto > saldoActual) {
            return res.status(200).json({
                success: false,
                message: `No tienes saldo suficiente para realizar este retiro`
            })
        }

        if(monto < 25 ){
            return res.status(200).json({
                success: false,
                message: `El monto minimo de retiro es de 25$`
            })
        }

        try {
            await Retiro.create({
                monto,
                fecha: new Date(),
                idUser: id,
                direccion,
                TxId,
                red,
                estado: 'Pendiente',
                fechaAprobacion: null,
                fechaRechazo: null,
                fotoComprobante: null,
                idAdmin: null,
                fantasma: false,
            });

            return res.status(200).json({
                response: {
                    monto,
                    fecha: new Date(),
                    idUser: id,
                    direccion,
                    red,
                    estado: 'Pendiente',
                },
                success: true,
                message: `Retiro creado`
            })

        } catch (error) {
            console.log(error)
        }
    },
    aprobar: async (req, res, next) => {
        const { id } = req.user
        const { idRetiro } = req.body

        try {
            const retiroEncontrado = await Retiro.findOneAndUpdate({ _id: idRetiro }, {
                estado: 'Aprobado',
                fechaAprobacion: new Date(),
                idAdmin: id
            }, { new: true })

            await User.findOneAndUpdate({ _id: retiroEncontrado.idUser }, {
                $inc: { saldoActual: -retiroEncontrado.monto }
            }, { new: true })

            return res.status(200).json({
                success: true,
                message: `Retiro Aprobado`
            })

        } catch (error) {
            console.log(error)
        }
    },
    rechazar: async (req, res, next) => {

        const { id } = req.user
        const { idRetiro } = req.body

        try {
            await Retiro.findOneAndUpdate({ _id: idRetiro }, {
                estado: 'Rechazado',
                fechaRechazo: new Date(),
                idAdmin: id
            }, { new: true })

            return res.status(200).json({
                success: true,
                message: `Retiro Rechazado`
            })

        } catch (error) {
            console.log(error)
        }
    },
    read: async (req, res, next) => {
        const { id } = req.user
        try {
            const retiros = await Retiro.find({ idUser: id })
            return res.status(200).json({
                success: true,
                response: retiros,
                message: `Retiros encontrados ${retiros.length}`
            })

        } catch (error) {
            console.log(error)
        }
    },
    readAdmin: async (req, res, next) => {
        const { id, role } = req.user
        try {
            if(role !== 'user') {
                const retiros = await Retiro.find({ idAdmin: id}).populate('idUser')
                return res.status(200).json({
                    success: true,
                    response: retiros,
                    message: `Retiros encontrados ${retiros.length}`
                })
            }   else {
                return res.status(200).json({
                    success: false,
                    message: `No tienes permisos para realizar esta accion`
                })
            }

        } catch (error) {
            console.log(error)
        }
    },
    readPending: async (req, res, next) => {

        try {
            const retiros = await Retiro.find({ estado: 'Pendiente' }).populate('idUser')
            return res.status(200).json({
                success: true,
                response: retiros,
                message: `Retiros encontrados ${retiros.length}`
            })

        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = controller;