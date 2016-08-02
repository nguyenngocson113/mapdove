var express = require('express');
var router = express.Router();
var FilesController = require('../controllers/files');
var multer = require('multer');

var upload = multer({
  dest: 'public/tmp'
});

/*GET*/
router.get('/getAllFile', FilesController.getAllFile);
router.get('/getFileByPath/:filePath', FilesController.getFileByPath);

/*POST*/
router.post('/uploadFile',upload.single('file'), FilesController.uploadFile);

router.param('fileId', FilesController.queryFile);

module.exports = router;