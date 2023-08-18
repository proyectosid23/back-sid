function userExistsResponse(req, res) {
    return res.status(400).json({
        success: false,
        message: 'Este usuario ya está registrado'
    })
}

function userSignedUpResponse(req, res) {
    return res.status(201).json({
        success: true,
        message: 'Te has registrado correctamente'
    })
}

function userSignedOutResponse(req, res) {
    return res.status(201).json({
        success: true,
        message: 'user signed out'
    })
}

function userNotFoundResponse(req, res) {
    return res.status(404).json({
        success: false,
        message: 'user not found'
    })
}

function mustSignInResponse(req, res) {
    return res.status(400).json({
        success: false,
        message: 'sign in please!'
    })
}

function invalidCredentialsResponse(req, res) {
    return res.status(401).json({
        success: false,
        message: 'Correo o contraseña incorrecta'
    })
}

function verifyResponse(req, res) {
    return res.status(401).json({
        success: false,
        message: 'Por favor, verifique su correo e intente de nuevo'
    })
}

function mustBeTheOwner(req, res) {
    return res.status(401).json({
        success: false,
        message: "You must be the owner to carry out this operation",
    });
}

function activityNotFound(req, res) {
    return res.status(404).json({
        success: false,
        message: "Couldn't find the activity",
    });
}

function codReferidoNotValid(req, res) {
    return res.status(404).json({
        success: false,
        message: 'El código de referido no es válido'
    })
}

module.exports = {
    userSignedUpResponse,
    userExistsResponse,
    userNotFoundResponse,
    userSignedOutResponse,
    mustSignInResponse,
    invalidCredentialsResponse,
    verifyResponse,
    mustBeTheOwner,
    activityNotFound,
    codReferidoNotValid
}