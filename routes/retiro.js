const router = require('express').Router();
const { crear, aprobar, rechazar,read, readAdmin, readPending } = require('../controllers/retiro');
const passport = require('../config/passport')

router.post('/', passport.authenticate('jwt', { session: false }), crear);
router.patch('/aprobar', passport.authenticate('jwt', { session: false }), aprobar);
router.patch('/rechazar', passport.authenticate('jwt', { session: false }), rechazar);
router.get('/misRetiros', passport.authenticate('jwt', { session: false }), read )
router.get('/retirosAdmin', passport.authenticate('jwt', { session: false }), readAdmin )
router.get('/retirosPendientes', passport.authenticate('jwt', { session: false }), readPending )

module.exports = router;    