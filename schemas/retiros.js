const joi = require(`joi`)

const schema = joi.object({
    monto: joi.number().required().messages({
        'number.base': `El monto debe ser de tipo numerico`,
        'number.empty': `El monto no puede estar vacio`,
        'any.required': `El monto es un campo requerido`
    }),
    fecha: joi.date().required().messages({
        'date.base': `La fecha debe ser de tipo date`,
        'date.empty': `La fecha no puede estar vacio`,
        'any.required': `La fecha es un campo requerido`
    }),
    idUser: joi.any().messages({
        'any.empty': `El idUser no puede estar vacio`,
    }),
    token: joi.string().required().messages({
        'string.base': `El token debe ser de tipo texto`,
        'string.empty': `El token no puede estar vacio`,
        'any.required': `El token es un campo requerido`
    }),
    red: joi.string().required().message({
        'any.required': 'La red es un campo requerido'
    })
    })

module.exports=schema;