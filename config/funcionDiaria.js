const cron = require('node-cron');
const User = require('../models/User');
const Retiro = require('../models/Retiro');

const funcionDiaria = async () => {
    let today = new Date();
    console.log('entró a la función diaria')
    try {

        const users = await User.find();
        const usuariosFiltrados = users.filter(user => user.planes.length !== 0);

        for (let user of usuariosFiltrados) {
            let nuevoSaldoActual = user.saldoActual;

            for (let plan of user.planes) {

                user = await User.findOne({ _id: user._id }).lean();

                let planc = user.planes.find(plann => plann._id.equals(plan._id));

                if (planc.estado !== 'activo' || planc.completo) {
                    continue;
                }

                let nuevoAcumulado = planc.acumulado + planc.porcentajeDiario;
                let calculoMontoTotal = planc.montoTotal - nuevoAcumulado;
                let calculoDias = Math.ceil(calculoMontoTotal / planc.porcentajeDiario);
                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + calculoDias);
                const fechaFinal = new Date()
                let acumuladoRestante = nuevoAcumulado - planc.montoTotal;
                if (nuevoAcumulado >= planc.montoTotal) {

                    await User.findOneAndUpdate(
                        { _id: user._id, 'planes._id': planc._id },
                        {
                            $set: {
                                'planes.$.completo': true,
                                'planes.$.acumulado': planc.montoTotal,
                                'planes.$.fechaFin': fechaFinal,
                            },
                        },
                        { new: true }
                    )

                    const userNuevo = await User.findOne({ _id: user._id }).lean();

                    for (const plansito of userNuevo.planes) {
                        if (plansito.completo === false && plansito.estado === 'activo') {
                            const nuevoAcumuladoo = plansito.acumulado + acumuladoRestante;
                            const calculoMontoTotal = plansito.montoTotal - nuevoAcumuladoo;
                            const calculoDias = Math.ceil(calculoMontoTotal / plansito.porcentajeDiario);
                            const futureDatee = new Date();
                            futureDatee.setDate(futureDatee.getDate() + calculoDias);
    
                            await User.findOneAndUpdate(
                                { _id: user._id, 'planes._id': plansito._id},
                                {
                                    $set: {
                                        'planes.$.fechaFin': futureDatee,
                                        'planes.$.acumulado': nuevoAcumuladoo,
                                    },
                                },
                                { new: true }
                            );
                            break;
                        }
                    }
                } else {
                    await User.findOneAndUpdate(
                        { _id: user._id, 'planes._id': plan._id },
                        {
                            $set: {
                                'planes.$.fechaFin': futureDate,
                                'planes.$.acumulado': nuevoAcumulado,
                            },
                        },
                        { new: true }
                    );
                }
                nuevoSaldoActual += plan.porcentajeDiario;
            }
                userNuevo = await User.findOne({ _id: user._id }).lean();
                const planesPorCompletar = userNuevo.planes.filter(plan => plan.completo === false && plan.estado === 'activo');
                if (planesPorCompletar.length === 0) {
                    const getRetiros = await Retiro.find({ idUser: userNuevo._id });
                    const totalRetirado = getRetiros.filter(retiro => retiro.estado === 'Aprobado').reduce((acc, retiro) => acc + retiro.monto, 0);
                    const totalGanancias = userNuevo.planes.reduce((acc, plan) => acc + plan.acumulado, 0);
                    await User.findOneAndUpdate(
                        { _id: userNuevo._id },
                        {
                            $set: {
                                saldoActual: totalGanancias - totalRetirado,
                            },
                        },
                        { new: true }
                    );
                } else { 
                    await User.findOneAndUpdate(
                        { _id: user._id },
                        {
                            $set: {
                                saldoActual: nuevoSaldoActual,
                            },
                        },
                        { new: true }
                    );
                }
        }
    } catch (error) {
        console.log(error);
    }

    console.log('Se ejecutó la función diaria', today.getHours(), ':', today.getMinutes(), ':', today.getSeconds(),) ;
};

cron.schedule('0 0 * * *', funcionDiaria);