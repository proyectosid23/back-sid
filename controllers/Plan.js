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
            const { name, direccion, direccionBanColombia, red, gananciaDiaria, ganancia25dias, ganancia50dias, ganancia75dias, gananciaTotal, valorPC } = req.body
            const newPlan = await Plan.create({
                name,
                red,
                direccion,
                direccionBanColombia,
                userModificate: id,
                gananciaDiaria,
                ganancia25dias,
                ganancia50dias,
                ganancia75dias,
                gananciaTotal,
                valorPC,
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
        const { direccion, red, direccionBanColombia, valorPC } = req.body
        const { idPlan } = req.params

        if (role !== "admin") {
            return res.status(200).json({
                success: false,
                response: null,
                message: "No tienes permisos para actualizar un plan"
            })
        }

        try {

            const modifiedPlan = await Plan.findByIdAndUpdate(idPlan, {
                direccion,
                red,
                userModificate: id,
                direccionBanColombia,
                valorPC
            }, {new: true})

            if (modifiedPlan){
                return res.status(200).json({
                    success: true,
                    response: modifiedPlan,
                    message: "Plan actualizado exitosamente"
                    })
            } 
            return res.status(400).json({
                success: false,
                message: "Error al modificar el plan"
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