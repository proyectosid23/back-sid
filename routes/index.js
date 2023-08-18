let router = require('express').Router();

let user = require('./user');
let retiro = require('./retiro');
let planes = require('./planes');
let plan = require('./plan');

router.use('/auth', user);
router.use('/retiro', retiro);
router.use('/planes', planes);
router.use('/plan', plan);

module.exports = router;
