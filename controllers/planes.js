const Planes = require('../models/Planes');
const User = require('../models/User');
const Retiro = require('../models/Retiro');

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


                    let primerReferido = await User.findOne({ codReferir: user.codReferido });

                    if (primerReferido) {
                        let planNoCompletadoEncontrado = false;
                        for (let i = 0; i < primerReferido.planes.length; i++) {
                            const plan1r = primerReferido.planes[i];
                            if (planNoCompletadoEncontrado) break;
                            if (!plan1r.completo && plan1r.estado === 'activo') {
                                let nuevoAcumulado = plan1r.acumulado + (10 * plan.monto) / 100;
                                let calculoMontoTotal = plan1r.montoTotal - nuevoAcumulado;
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
                                    { new: true },
                                    );
                                if (nuevoAcumulado >= plan1r.montoTotal) {
                                    let acumuladoRestante = nuevoAcumulado - plan1r.montoTotal;
                                    let today = new Date();
                                    today.setDate(today.getDate());
                                    await User.findOneAndUpdate(
                                        { _id: primerReferido._id, 'planes._id': plan1r._id },
                                        {
                                            $set: {
                                                'planes.$.fechaFin': today,
                                                'planes.$.completo': true,
                                                'planes.$.acumulado': plan1r.montoTotal,
                                            },
                                        },
                                        { new: true }
                                    );

                                    primerReferido = await User.findOne({ codReferir: user.codReferido }).lean();
                                    
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
                                            break
                                        }
                                    }
                                }

                                primerReferido = await User.findOne({ codReferir: user.codReferido }).lean();
                                const planesPorCompletar = primerReferido.planes.filter(plan => !plan.completo && plan.estado === 'activo');
                                if(planesPorCompletar.length === 0){
                                    const getRetiros = await Retiro.find({ idUser: primerReferido._id });
                                    const totalRetirado = getRetiros.filter(retiro => retiro.estado === 'Aprobado').reduce((acc, retiro) => acc + retiro.monto, 0);
                                    const totalGanacias = primerReferido.planes.reduce((acc, plan) => acc + plan.montoTotal, 0);
                                    await User.findOneAndUpdate(
                                        { _id: primerReferido._id },
                                        {
                                            $set: {
                                                saldoActual: totalGanacias - totalRetirado,
                                            },
                                        },
                                        { new: true }
                                    );

                                }else{
                                    await User.findOneAndUpdate(
                                        { _id: primerReferido._id },
                                        {
                                            $set: {
                                                saldoActual: primerReferido.saldoActual + (10 * plan.monto) / 100,
                                            },
                                        },
                                        { new: true }
                                    );
                                }

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
                                    let today = new Date();
                                    today.setDate(today.getDate());
                                    await User.findOneAndUpdate(
                                        { _id: segundoReferido._id, 'planes._id': planDos._id },
                                        {
                                            $set: {
                                                'planes.$.fechaFin': today,
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
                                segundoReferido = await User.findOne({ codReferir: primerReferido.codReferido }).lean();
                                const planesPorCompletar = segundoReferido.planes.filter(plan => !plan.completo && plan.estado === 'activo');
                                if (planesPorCompletar.length === 0) {
                                    const getRetiros = await Retiro.find({ idUser: segundoReferido._id });
                                    const totalRetirado = getRetiros.filter(retiro => retiro.estado === 'Aprobado').reduce((acc, retiro) => acc + retiro.monto, 0);
                                    const totalGanacias = segundoReferido.planes.reduce((acc, plan) => acc + plan.montoTotal, 0);
                                    await User.findOneAndUpdate(
                                        { _id: segundoReferido._id },
                                        {
                                            $set: {
                                                saldoActual: totalGanacias - totalRetirado,
                                            },
                                        },
                                        { new: true }
                                    );
                                } else {
                                    await User.findOneAndUpdate(
                                        { _id: segundoReferido._id },
                                        {
                                            $set: {
                                                saldoActual: segundoReferido.saldoActual + (5 * plan.monto) / 100,
                                            },
                                        },
                                        { new: true }
                                    );
                                }

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
                            if(plan.idAdmin === null) continue;
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

    infoTotal: async (req, res, next) => {

        const { role } = req.user;
        const { fecha } = req.body;

        let planesVendidosTotales = 0;
        let planesVendidosTotalesInfo = [];
        let planesActivosTotales = 0;
        let planesActivosTotalesInfo = [];
        let planesCompletadosTotales = 0;
        let planesCompletadosTotalesInfo = [];
        let planesRechazadosTotales = 0;
        let planesRechazadosTotalesInfo = [];
        let planesPendientesTotales = 0;
        let planesPendientesTotalesInfo = [];
        let retirosPendientes = 0;
        let retirosPendientesInfo = [];
        let retirosTotales = 0;
        let retirosTotalesInfo = [];
        let gananciasTotales = 0;
        let abonosTotales = 0;
        let planesVendidosHoy = 0;
        let planesVendidosHoyInfo = [];
        let planesActivosHoy = 0;
        let planesActivosHoyInfo = [];
        let planesCompletadosHoy = 0;
        let planesCompletadosHoyInfo = [];
        let planesRechazadosHoy = 0;
        let planesRechazadosHoyInfo = [];
        let planesPendientesHoy = 0;
        let planesPendientesHoyInfo = [];
        let retirosPendientesHoy = 0;
        let retirosPendientesHoyInfo = [];
        let retirosTotalesHoy = 0;
        let retirosTotalesHoyInfo = [];
        let gananciasHoy = 0;
        let abonosHoy = 0;

        if (role === 'admin') {
            try{

                //Se Obtienen los usuarios y se llena la informacion de los planes y se calculan las ganancias totales
                const usuarios = await User.find({});

                for (const usuario of usuarios) {
                    if (usuario.planes.length > 0){
                        for (const plan of usuario.planes) {
                            
                            const diaFechaPlan = plan.fechaInicio.getDate();
                            const mesFechaPlan = plan.fechaInicio.getMonth() + 1;
                            const anioFechaPlan = plan.fechaInicio.getFullYear();
                            const fechaPlan = `${diaFechaPlan}/${mesFechaPlan}/${anioFechaPlan}`;

                            if (plan.estado === 'activo' && !plan.completo ) {
                                planesActivosTotales += 1;
                                planesActivosTotalesInfo.push(plan);
                                gananciasTotales += plan.monto;    
                                
                                //Se obtienen la fecha del plan y la fecha de hoy para comparar si el plan se activo hoy
                                if(fechaPlan === fecha){
                                    planesActivosHoy += 1;
                                    planesActivosHoyInfo.push(plan);
                                    gananciasHoy += plan.monto;
                                    planesVendidosHoy += 1;
                                    planesVendidosHoyInfo.push(plan);
                                }

                                planesVendidosTotalesInfo.push(plan);
                                planesVendidosTotales += 1;

                            } else if (plan.estado === 'rechazado' && !plan.completo) {
                                planesRechazadosTotales += 1;
                                planesRechazadosTotalesInfo.push(plan);

                                //Se obtienen la fecha del plan y la fecha de hoy para comparar si el plan se rechazo hoy
                                if(fechaPlan === fecha){
                                    planesRechazadosHoy += 1;
                                    planesRechazadosHoyInfo.push(plan);
                                }
                            } else if (plan.estado === 'pendiente' && !plan.completo) {
                                planesPendientesTotales += 1;
                                planesPendientesTotalesInfo.push(plan);

                                //Se obtienen la fecha del plan y la fecha de hoy para comparar si el plan se vendio hoy
                                if(fechaPlan === fecha){
                                    planesPendientesHoy += 1;
                                    planesPendientesHoyInfo.push(plan);
                                }

                            } else if(plan.completo){
                                planesCompletadosTotales += 1;
                                gananciasTotales += plan.monto;
                                planesCompletadosTotalesInfo.push(plan);

                                //Se obtienen la fecha del plan y la fecha de hoy para comparar si el plan se completo hoy
                                if(fechaPlan === fecha){
                                    planesCompletadosHoy += 1;
                                    planesCompletadosHoyInfo.push(plan);
                                    gananciasHoy += plan.monto;
                                    planesVendidosHoy += 1;
                                    planesVendidosHoyInfo.push(plan);
                                }

                                planesVendidosTotalesInfo.push(plan);
                                planesVendidosTotales += 1;
                            }
                        }
                    }
                }

                //Se obtienen los retiros y se llena la informacion de los retiros y se calculas los abonos totales

                const retiros = await Retiro.find({});
                for (const retiro of retiros) {
                    let diaFechaRetiro = retiro.fecha.getDate();
                    let mesFechaRetiro = retiro.fecha.getMonth() + 1;
                    let anioFechaRetiro = retiro.fecha.getFullYear();
                    let fechaRetiro = `${diaFechaRetiro}/${mesFechaRetiro}/${anioFechaRetiro}`;

                    if (retiro.estado === 'Pendiente') {
                        retirosPendientes += 1;
                        retirosPendientesInfo.push(retiro);

                        //Se obtienen la fecha del retiro y la fecha de hoy para comparar si el retiro se hizo hoy
                        if(fechaRetiro === fecha){
                            retirosPendientesHoy += 1;
                            retirosPendientesHoyInfo.push(retiro);
                        }

                    } else if (retiro.estado === 'Aprobado') {
                        retirosTotales += 1;
                        retirosTotalesInfo.push(retiro);
                        abonosTotales += retiro.monto;

                        //Se obtienen la fecha del retiro y la fecha de hoy para comparar si el retiro se hizo hoy
                        if(fechaRetiro === fecha){
                            retirosTotalesHoy += 1;
                            retirosTotalesHoyInfo.push(retiro);
                            abonosHoy += retiro.monto;
                        }
                    }
                }

                return res.status(200).json({
                    success: true,
                    message: 'Informacion obtenida con exito',
                    response: {
                        informacionTotal: {
                            planesVendidosTotales: {
                                cantidad: planesVendidosTotales,
                                info: planesVendidosTotalesInfo
                            },
                            planesActivosTotales: {
                                cantidad: planesActivosTotales,
                                info: planesActivosTotalesInfo
                            },
                            planesCompletadosTotales: {
                                cantidad: planesCompletadosTotales,
                                info: planesCompletadosTotalesInfo
                            },
                            planesRechazadosTotales: {
                                cantidad: planesRechazadosTotales,
                                info: planesRechazadosTotalesInfo
                            },
                            planesPendientesTotales: {
                                cantidad: planesPendientesTotales,
                                info: planesPendientesTotalesInfo
                            },
                            retirosPendientes: {
                                cantidad: retirosPendientes,
                                info: retirosPendientesInfo
                            },
                            retirosTotales: {
                                cantidad: retirosTotales,
                                info: retirosTotalesInfo
                            },
                            gananciasTotales: gananciasTotales,
                            abonosTotales: abonosTotales,

                        },
                        informacionHoy: {
                            planesVendidosHoy: {
                                cantidad: planesVendidosHoy,
                                info: planesVendidosHoyInfo
                            },
                            planesActivosHoy: {
                                cantidad: planesActivosHoy,
                                info: planesActivosHoyInfo
                            },
                            planesCompletadosHoy: {
                                cantidad: planesCompletadosHoy,
                                info: planesCompletadosHoyInfo
                            },
                            planesRechazadosHoy: {
                                cantidad: planesRechazadosHoy,
                                info: planesRechazadosHoyInfo
                            },
                            planesPendientesHoy: {
                                cantidad: planesPendientesHoy,
                                info: planesPendientesHoyInfo
                            },
                            retirosPendientesHoy: {
                                cantidad: retirosPendientesHoy,
                                info: retirosPendientesHoyInfo
                            },
                            retirosTotalesHoy: {
                                cantidad: retirosTotalesHoy,
                                info: retirosTotalesHoyInfo
                            },
                            gananciasHoy: gananciasHoy,
                            abonosHoy: abonosHoy,
                        },
                    }
                });

                
            } catch (error) {
                console.log(error);
            }
        } else {
            return res.status(200).json({
                success: false,
                message: 'No tienes permisos para realizar esta acción',
                response: null
            });
        }

    }

}

module.exports = controller;