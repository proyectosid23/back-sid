const router = require('express').Router();
const passport = require('../config/passport')
const { buy, activarPlan, verPlanesSinActivar, verMisActivaciones, rechazarPlan } = require('../controllers/planes');

router.post('/buy', passport.authenticate('jwt', { session: false }), buy)
router.post('/activar/:idPlan', passport.authenticate('jwt', { session: false }), activarPlan)
router.post('/rechazar/:idPlan', passport.authenticate('jwt', { session: false }), rechazarPlan)
router.get('/verPlanesSinActivar', passport.authenticate('jwt', { session: false }), verPlanesSinActivar)
router.get('/verMisActivaciones', passport.authenticate('jwt', { session: false }), verMisActivaciones)

module.exports = router;    