var express = require('express');
var router = express.Router();

var roundtrips = [];

/* GET home page. */

router.get('/', function(req, res, next) {
   res.render('index', { title: 'Beacon API demo', data: JSON.stringify(roundtrips) });
});

/* Beacon timestamp reporting */
router.post('/data', function(req, res, next) {
   receivedTime = Date.now().toString();
   requestTime = req.body;

   console.log('Incoming beacon data');

   var trip = {
      beacon_sent: requestTime,
      beacon_received: receivedTime
   };
   roundtrips.push(trip);
   console.log("Current roundtrips data: " + JSON.stringify(roundtrips));
   res.end();
});

module.exports = router;
