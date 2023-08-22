const router = require('express').Router();
const passport = require('../config/passport')

const { create, getAll, update } = require('../controllers/Plan');

router.post('/create', passport.authenticate('jwt', { session: false }), create);
router.get('/all', passport.authenticate('jwt', { session: false }), getAll);
router.put('/update/:idPlan', passport.authenticate('jwt', { session: false }), update);




module.exports = router;