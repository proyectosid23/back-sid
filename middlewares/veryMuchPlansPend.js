const User = require("../models/User");

async function veryMuchPlansPend(req, res, next) {
    const user = await User.findOne({_id: req.user.id})
    const planesPend = user.planes.filter(plan => plan.estado === 'pendiente')
    if (planesPend.length >= 2) {
        return res.status(400).json({message: 'No puedes tener más de 2 planes pendientes'})
    }
    return next()
}

module.exports = veryMuchPlansPend