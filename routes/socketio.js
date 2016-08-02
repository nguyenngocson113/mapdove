var express = require('express');
var router = express.Router();
var SocketIO = require('../controllers/socketio');
var Utilities = require('../utilities/utilities');

/* ADD TO ROOM */
router.post('/add', function  (req, res) {
	SocketIO.add(req.body, function  (result) {
		res.jsonp(result);
	});
});

/* SEEN MESSAGE */
router.post('/seen', function  (req, res) {
	SocketIO.seen(req.body, function  (result) {
		res.jsonp(result);
	});
});

router.post('/addLocation', function (req, res) {
	SocketIO.addLocation(req.user, req.body, function (results) {
		res.jsonp(Utilities.response(true, results));
	});
});

module.exports = router;
