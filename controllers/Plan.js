const Plan = require("../models/Plan")

const controller = {

    create: async (req, res) => {

        const { id, role } = req.user
        if (role !== "admin") {
            return res.status(200).json({
                success: false,
                response: null,
                message: "No tienes permisos para crear un plan"
            })

        }

        try {
            const { name, direccion, gananciaDiaria, ganancia25dias, ganancia50dias, ganancia75dias, gananciaTotal } = req.body
            const newPlan = await Plan.create({
                name,
                direccion,
                userModificate: req.user._id,
                gananciaDiaria,
                ganancia25dias,
                ganancia50dias,
                ganancia75dias,
                gananciaTotal
            })

            return res.status(200).json({
                success: true,
                content: newPlan,
                message: "Plan creado exitosamente"
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                content: error,
                message: "Error al crear el plan"
            })
        }
    },

    getAll: async (req, res) => {

        try {

            const planes = await Plan.find()

            return res.status(200).json({
                success: true,
                response: planes,
                message: "Planes encontrados"
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                response: error,
                message: "Error al buscar los planes"
            })
        }


    },

    update: async (req, res) => {
        const { id, role } = req.user
        const {plan, direccion} = req.body

        if (role !== "admin") {
            return res.status(200).json({
                success: false,
                response: null,
                message: "No tienes permisos para actualizar un plan"
            })
        }

        try {

            const planAModificar = await Plan.findOneAndUpdate( {"plan.ganancia25dias": plan} , {
                direccion: direccion,
                userModificate: id,
            },
            { new: true }
            )

            return res.status(200).json({
                success: true,
                response: planAModificar,
                message: "Plan actualizado exitosamente"
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                response: error,
                message: "Error al actualizar el plan"
            })
        }
    },


}

module.exports = controller;