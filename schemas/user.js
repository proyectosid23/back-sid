const joi = require(`joi`)

const schema = joi.object({
    name: joi.string().min(3).max(30).required().messages({
        'string.base': `El nombre debe ser de tipo texto`,
        'string.empty': `El nombre no puede estar vacio`,
        'string.min': `El nombre debe tener un minimo de 3 caracteres`,
        'string.max': `El nombre debe tener un maximo de 30 caracteres`,
        'any.required': `El nombre es un campo requerido`
    }),
    lastName: joi.string().min(3).max(30).required().messages({
        'string.base': `El apellido debe ser de tipo texto`,
        'string.empty': `El apellido no puede estar vacio`,
        'string.min': `El apellido debe tener un minimo de 3 caracteres`,
        'string.max': `El apellido debe tener un maximo de 30 caracteres`,
        'any.required': `El apellido es un campo requerido`
    }),
    email: joi.string().email().required().messages({
        'string.base': `El email debe ser de tipo texto`,
        'string.empty': `El email no puede estar vacio`,
        'string.email': `El email debe ser un email valido`,
        'any.required': `El email es un campo requerido`
    }),
    password: joi.string().min(8).max(30).required().messages({
        'string.base': `La contraseña debe ser de tipo texto`,
        'string.empty': `La contraseña no puede estar vacio`,
        'string.min': `La contraseña debe tener un minimo de 8 caracteres`,
        'string.max': `La contraseña debe tener un maximo de 30 caracteres`,
        'any.required': `La contraseña es un campo requerido`
    }),
    role: joi.string().messages({
        'string.base': `El rol debe ser de tipo texto`,
        'string.empty': `El rol no puede estar vacio`,
    }),
    codReferido: joi.string().required().messages({
        'number.empty': `El codigo de referido no puede estar vacio`,
        'any.required': `El codigo de referido es un campo requerido`
    })
})

module.exports=schema;