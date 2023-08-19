const router = require('express').Router();
const schema = require('../schemas/user');
const schemaSignin = require('../schemas/userSignin');
const passport = require('../config/passport')
const validator = require('../middlewares/validator');
const accountExistsSignUp = require('../middlewares/accountExistsSignUp')
const accountExistsSignIn = require('../middlewares/accountExistsSignIn')
const accountHasBeenVerified = require('../middlewares/accountHasBeenVerified')
const codReferidoNotValidMid = require('../middlewares/codReferidoNotValidMid')
const mustSignIn = require('../middlewares/mustSignIn')
const { register, verify, login, loginWithToken, logout, readOne, update, read } = require('../controllers/user');

router.post('/sign-up',validator(schema), accountExistsSignUp, codReferidoNotValidMid, register);
router.post('/sign-in', validator(schemaSignin), accountExistsSignIn, accountHasBeenVerified, login)
router.post('/sign-out', passport.authenticate('jwt', { session: false }), logout)
router.get('/', read )

router.get('/verify/:code', verify);
router.post('/token', passport.authenticate('jwt', { session: false }), mustSignIn, loginWithToken)


router.route('/me/:id')
    .get(readOne)
    .patch(update)

module.exports = router;    