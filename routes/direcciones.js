const router = require('express').Router();
const passport = require('../config/passport')

const { direccion100, direccion200, direccion500, direccion1000, direccion2000 } = require('../controllers/direcciones');

router.get('/direccion100', passport.authenticate('jwt', { session: false }), direccion100)
router.get('/direccion200', passport.authenticate('jwt', { session: false }), direccion200)
router.get('/direccion500', passport.authenticate('jwt', { session: false }), direccion500)
router.get('/direccion1000', passport.authenticate('jwt', { session: false }), direccion1000)
router.get('/direccion2000', passport.authenticate('jwt', { session: false }), direccion2000)
