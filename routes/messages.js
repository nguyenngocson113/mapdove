var express = require('express');
var router = express.Router();
var MessageControllers = require('../controllers/messages');

/*Create room*/
router.get('/getMessagesByRoomId/:roomId', MessageControllers.getMessagesByRoomId);

router.post('/chat', function  (req, res) {
	MessageControllers.chat(req.user, req.body, function  (data) {
		res.jsonp(data);
	});
});

module.exports = router;