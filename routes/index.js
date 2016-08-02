var express = require('express');
var router = express.Router();
var IndexControllers = require('../controllers/index');
/*Login user*/
router.post('/login', IndexControllers.login);

module.exports = router;
