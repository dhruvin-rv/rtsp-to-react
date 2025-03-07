var express = require('express');
const { startRTSPStream } = require('../rtsp_stream');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/start', startRTSPStream);

module.exports = router;
