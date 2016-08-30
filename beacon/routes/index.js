var express = require('express');
var router = new express.Router();

var roundtrips = [];

/* GET home page. */

router.get('/', function(req, res) {
	'use strict';
	res.render('index', { title: 'Beacon API demo', data: JSON.stringify(roundtrips) });
});

/* Beacon timestamp reporting */
router.post('/data', function(req, res) {
	'use strict';
	var receivedTime = Date.now().toString();
	 var requestTime = req.body;

	console.log('Incoming beacon data');

	var trip = {
		beaconSent: requestTime,
		beaconReceived: receivedTime
	};
	roundtrips.push(trip);
	console.log('Current roundtrips data: ' + JSON.stringify(roundtrips));
	res.end();
});

module.exports = router;
