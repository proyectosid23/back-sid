const Planes = require('../models/Planes');
const User = require('../models/User');

const controller = {

    buy: async (req, res, next) => {
        try {
            const { plan, image, TxId } = req.body;
            const { id, name, lastName, email } = req.user;
            const fechaInicio = new Date();
            const fechaFin = new Date();
            const acumulado = 0;
            const estado = 'pendiente';
            fechaFin.setDate(fechaInicio.getDate() + 75);
            const newPlan = new Planes({
                plan: plan.name,
                estado,
                TxId,
                capturaDePago: image,
                fechaInicio,
                fechaFin,
                monto: plan.ganancia25dias,
                montoTotal: plan.gananciaTotal,
                porcentajeDiario: plan.gananciaDiaria,
                acumulado,
                userBuy: {
                    id,
                    name,
                    lastName,
                    email
                },
                idAdmin: null,
                completo: false,
            });

            const user = await User.findById(id);
            if (user) {
                user.planes.push(newPlan);
                await user.save();
                res.status(200).json(
                    success = true,
                    message = 'Plan comprado con exito',
                    data = newPlan
                )
            } else {
                res.status(400).json(
                    success = false,
                    message = 'No se pudo comprar el plan',
                    data = null
                )
            }

        } catch (error) {
            console.log(error);
        }
    },

    activarPlan: async (req, res, next) => {
        try {
            const { id } = req.user;
            const { idPlan } = req.params;
            const { userId } = req.body;
            const user = await User.findById(userId);
            if (user) {
                const plan = user.planes.find(plan => plan._id == idPlan);
                if (plan) {

                    await User.findOneAndUpdate(
                        { _id: userId, 'planes._id': plan._id },
                        {
                            $set: {
                                'planes.$.estado': 'activo',
                                'planes.$.idAdmin': id
                            }
                        },
                        { new: true }
                    );

                    const primerReferido = await User.findOne({ codReferir: user.codReferido });

                    if (primerReferido) {
                        let planNoCompletadoEncontrado = false;
                        for (let i = 0; i < primerReferido.planes.length; i++) {
                            const plan1r = primerReferido.planes[i];
                            if (planNoCompletadoEncontrado) break;
                            if (!plan1r.completo && plan1r.estado === 'activo') {
                                let nuevoAcumulado = plan1r.acumulado + (10 * plan.monto) / 100;
                                let calculoMontoTotal = plan.montoTotal - nuevoAcumulado;
                                let calculoDias = Math.ceil(calculoMontoTotal / plan1r.porcentajeDiario);
                                const futureDate = new Date();
                                futureDate.setDate(futureDate.getDate() + calculoDias);
                                await User.findOneAndUpdate(
                                    { _id: primerReferido._id, 'planes._id': plan1r._id },
                                    {
                                        $set: {
                                            'planes.$.fechaFin': futureDate,
                                            'planes.$.acumulado': nuevoAcumulado,
                                        },
                                    },
                                    { new: true }
                                );
                                if (nuevoAcumulado >= plan1r.montoTotal) {
                                    let acumuladoRestante = nuevoAcumulado - plan1r.montoTotal;
                                    await User.findOneAndUpdate(
                                        { _id: primerReferido._id, 'planes._id': plan1r._id },
                                        {
                                            $set: {
                                                'planes.$.completo': true,
                                                'planes.$.acumulado': plan1r.montoTotal,
                                            },
                                        },
                                        { new: true }
                                    );
                                    for (let j = 0; j < primerReferido.planes.length; j++) {
                                        const plansito = primerReferido.planes[j];
                                        if (!plansito.completo && plansito.estado === 'activo') {
                                            let nuevoAcumulado = plansito.acumulado + acumuladoRestante;
                                            let calculoMontoTotal = plansito.montoTotal - nuevoAcumulado;
                                            let calculoDias = Math.ceil(calculoMontoTotal / plansito.porcentajeDiario);
                                            const futureDate = new Date();
                                            futureDate.setDate(futureDate.getDate() + calculoDias);
                                            await User.findOneAndUpdate(
                                                { _id: primerReferido._id, 'planes._id': plansito._id },
                                                {
                                                    $set: {
                                                        'planes.$.fechaFin': futureDate,
                                                        'planes.$.acumulado': nuevoAcumulado,
                                                    },
                                                },
                                                { new: true }
                                            );
                                        }
                                    }
                                }

                                await User.findOneAndUpdate(
                                    { _id: primerReferido._id },
                                    {
                                        $set: {
                                            saldoActual: primerReferido.saldoActual + (10 * plan.monto) / 100,
                                        },
                                    },
                                    { new: true }
                                );

                                planNoCompletadoEncontrado = true;
                            }
                        }
                    }

                    let segundoReferido = await User.findOne({ codReferir: primerReferido.codReferido });
                    if (segundoReferido) {
                        let planNoCompletadoEncontrado = false
                        for (let i = 0; i < segundoReferido.planes.length; i++) {
                            const planDos = segundoReferido.planes[i];
                            if (planNoCompletadoEncontrado) break;
                            if (!planDos.completo && planDos.estado === 'activo') {
                                let nuevoAcumulado = planDos.acumulado + (5 * plan.monto) / 100;
                                let porcentajeDiario = (4 * planDos.monto) / 100;
                                let calculoMontoTotal = planDos.montoTotal - nuevoAcumulado;
                                let calculoDias = Math.ceil(calculoMontoTotal / porcentajeDiario);
                                const futureDate = new Date();
                                futureDate.setDate(futureDate.getDate() + calculoDias);
                                await User.findOneAndUpdate(
                                    { _id: segundoReferido._id, 'planes._id': planDos._id },
                                    {
                                        $set: {
                                            'planes.$.fechaFin': futureDate,
                                            'planes.$.acumulado': nuevoAcumulado,
                                        },
                                    },
                                    { new: true }
                                );
                                if (nuevoAcumulado >= planDos.montoTotal) {
                                    let acumuladoRestante = nuevoAcumulado - planDos.montoTotal;
                                    await User.findOneAndUpdate(
                                        { _id: segundoReferido._id, 'planes._id': planDos._id },
                                        {
                                            $set: {
                                                'planes.$.completo': true,
                                                'planes.$.acumulado': planDos.montoTotal,
                                            },
                                        },
                                        { new: true }
                                    );

                                    segundoReferido = await User.findOne({ codReferir: primerReferido.codReferido }).lean();

                                    for (let j = 0; j < segundoReferido.planes.length; j++) {
                                        const plansitoDos = segundoReferido.planes[j];
                                        if (!plansitoDos.completo && plansitoDos.estado === 'activo') {
                                            let nuevoAcumuladoo = plansitoDos.acumulado + acumuladoRestante;
                                            let calculoMontoTotall = plansitoDos.montoTotal - nuevoAcumulado;
                                            let calculoDiass = Math.ceil(calculoMontoTotall / plansitoDos.porcentajeDiario);
                                            const futureDatee = new Date();
                                            futureDate.setDate(futureDate.getDate() + calculoDiass);
                                            await User.findOneAndUpdate(
                                                { _id: segundoReferido._id, 'planes._id': plansitoDos._id },
                                                {
                                                    $set: {
                                                        'planes.$.fechaFin': futureDatee,
                                                        'planes.$.acumulado': nuevoAcumuladoo,
                                                    },
                                                },
                                                { new: true }
                                            );
                                            break
                                        }
                                        
                                    }
                                }
                                await User.findOneAndUpdate(
                                    { _id: segundoReferido._id },
                                    {
                                        $set: {
                                            saldoActual: segundoReferido.saldoActual + (5 * plan.monto) / 100,
                                        },
                                    },
                                    { new: true }
                                );
                                planNoCompletadoEncontrado = true;
                            }
                        }
                    }

                    return res.status(200).json({
                        success: true,
                        message: 'Plan activado con exito',
                        data: plan
                    })
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'No se pudo activar el plan',
                        data: null
                    })
                }
            } else {
                res.status(400).json(
                    success = false,
                    message = 'No se encontro el usuario',
                    data = null
                )
            }
        } catch (error) {
            console.log(error);
        }
    },
    verPlanesSinActivar: async (req, res, next) => {
        try {
            const { role } = req.user;
            if (role === 'admin') {
                const usuarios = await User.find({ 'planes.estado': 'pendiente' });

                let planesSinActivar = [];

                for (const usuario of usuarios) {
                    for (const plan of usuario.planes) {
                        if (plan.estado === 'pendiente') {
                            planesSinActivar.push(plan)
                        }
                    }
                }

                if (planesSinActivar.length > 0) {
                    return res.status(200).json({
                        success: true,
                        message: 'Planes encontrados',
                        response: planesSinActivar
                    });
                } else {
                    return res.status(200).json({
                        success: false,
                        message: 'No se encontraron planes',
                        response: null
                    });
                }
            } else {
                return res.status(200).json({
                    success: false,
                    message: 'No tienes permisos para realizar esta acción',
                    response: null
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                response: null
            });
        }
    },
    verMisActivaciones: async (req, res, next) => {
        try {
            const { id, role } = req.user;
            if (role === 'admin') {
                const usuarios = await User.find({ 'planes.idAdmin': id });
                let planesActivados = [];
                if (usuarios) {
                    for (const usuario of usuarios) {
                        for (const plan of usuario.planes) {
                            if (plan.idAdmin.equals(id)) {
                                planesActivados.push(plan)
                            }
                        }
                    }

                    if (planesActivados.length > 0) {
                        return res.status(200).json({
                            success: true,
                            message: 'Planes encontrados',
                            response: planesActivados
                        });
                    } else {
                        return res.status(200).json({
                            success: false,
                            message: 'No se encontraron planes',
                            response: null
                        });
                    }
                } else {
                    return res.status(200).json({
                        success: false,
                        message: 'No se encontraron planes',
                        response: null
                    });
                }

            } else {
                return res.status(200).json({
                    success: false,
                    message: 'No tienes permisos para realizar esta acción',
                    response: null
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                response: null
            });
        }
    },

    rechazarPlan: async (req, res, next) => {
        const { id, role } = req.user;
        const { idPlan } = req.params;
        const { userId } = req.body;
        if (role === 'admin') {
            const user = await User.findById(userId);
            if (user) {
                const plan = user.planes.find(plan => plan._id == idPlan);
                if (plan) {
                    const updatePlan = await User.findOneAndUpdate(
                        { _id: userId, 'planes._id': plan._id },
                        {
                            $set: {
                                'planes.$.estado': 'rechazado',
                                'planes.$.idAdmin': id
                            }
                        },
                        { new: true }
                    );
                    return res.status(200).json({
                        success: true,
                        message: 'Plan rechazado con exito',
                        data: plan
                    })
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'No se pudo rechazar el plan',
                        data: null
                    })
                }
            } else {
                res.status(400).json(
                    success = false,
                    message = 'No se encontro el usuario',
                    data = null
                )
            }
        } else {
            return res.status(200).json({
                success: false,
                message: 'No tienes permisos para realizar esta acción',
                response: null
            });
        }
    },

}

module.exports = controller;