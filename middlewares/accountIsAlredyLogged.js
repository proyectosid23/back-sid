const { cloudfunctions } = require("googleapis/build/src/apis/cloudfunctions");
const User = require("../models/User");

async function accountIsAlredyLogged(req, res, next) {
    const user = await User.findOne({email: req.body.email})
    if (user.logged === true && user.role === "user") {
        return res.status(400).json({message: "Hay una sesión activa en otro dispositivo."})
    }
    return next()
}

module.exports = accountIsAlredyLogged
