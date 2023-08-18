const User = require("../models/User");
const { invalidCredentialsResponse } = require("../config/responses");

async function accountExistsSignIn(req, res, next) {
    const user = await User.findOne({email: req.body.email})
    if (user) {
        req.user = {
            id: user._id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            password: user.password,
            role: user.role,
            verified: user.verified,
            planes: user.planes,
            saldoActual: user.saldoActual,
            logged: user.logged,
            codReferir: user.codReferir,
            codReferido: user.codReferido,
            referidos: user.referidos,
        }
        return next()
    }
    return invalidCredentialsResponse(req,res)
}

module.exports = accountExistsSignIn
