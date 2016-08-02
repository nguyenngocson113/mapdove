var express = require('express');
var router = express.Router();
var FriendControllers = require('../controllers/friends');


router.post('/addFriend/:targetId', FriendControllers.addFriend);

router.post('/acceptFriend/:friendId', FriendControllers.acceptFriend);
module.exports = router;