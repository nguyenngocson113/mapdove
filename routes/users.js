var express = require('express');
var router = express.Router();
var UsersController = require('../controllers/users');
var Utilities = require('../utilities/utilities');

var SocketIO = require('../controllers/socketio');

/* ADD TO ROOM */
router.post('/add', function  (req, res) {
	SocketIO.add(req.body, function  (result) {
		res.jsonp(result);
	});
});

/* SEEN MESSAGE */
router.post('/seen', function  (req, res) {
	SocketIO.seen(req.body, function  (result) {
		res.jsonp(Utilities.response(true, result));
	});
});

/* GET LIST USER */
router.get('/getListUser', UsersController.getListUser);

/* USER RESTFUL */
router.get('/:leanUserId', UsersController.show);
router.post('/', UsersController.create);

/* MIDDLEWARE */
router.param('leanUserId', UsersController.queryLeanUser); // Lean
router.param('userId', UsersController.queryUser); // Object

module.exports = router;
