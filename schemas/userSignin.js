const joi = require(`joi`)

const schema = joi.object({
    email: joi
        .string()
        .required()
        .email()
        .messages({
            "string.required": "Por favor ingrese un correo",
            "string.empty": "Por favor ingrese un correo",
            "string.email": "Por favor ingrese un correo valido",
            "string.base": "Por favor ingrese un correo valido"
        }),
    password: joi
        .string()
        .required()
        .messages({
            "string.required": "Por favor ingrese una contraseña",
            "string.empty": "Por favor ingrese una contraseña",
            "string.base": "Por favor ingrese una contraseña"
        }),
})

module.exports=schema;