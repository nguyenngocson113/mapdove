var express = require('express');
var router = express.Router();
var RoomsController = require('../controllers/rooms');

/* GET LIST ROOM */
router.get('/getListRoom', RoomsController.getListRoom);

/* ROOM RESTFUL */
router.post('/', RoomsController.create);

module.exports = router;