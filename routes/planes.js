const router = require('express').Router();
const passport = require('../config/passport')
const { buy, activarPlan, verPlanesSinActivar, verMisActivaciones } = require('../controllers/planes');

/* router.get('/verify/:code', verify);
router.post('/token', passport.authenticate('jwt', { session: false }), mustSignIn, loginWithToken) */

router.post('/buy', passport.authenticate('jwt', { session: false }), buy)
router.post('/activar/:idPlan', passport.authenticate('jwt', { session: false }), activarPlan)
router.get('/verPlanesSinActivar', passport.authenticate('jwt', { session: false }), verPlanesSinActivar)
router.get('/verMisActivaciones', passport.authenticate('jwt', { session: false }), verMisActivaciones)

module.exports = router;    