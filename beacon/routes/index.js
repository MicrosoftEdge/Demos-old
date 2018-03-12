const express = require('express');
const router = new express.Router();

const roundtrips = [];

/* GET home page. */

router.get('/', function(req, res) {
	'use strict';

	res.render('index', { title: 'Beacon API demo', data: JSON.stringify(roundtrips) });
});

/* Beacon timestamp reporting */
router.post('/data', function(req, res) {
	'use strict';

	const receivedTime = Date.now().toString();
	 const requestTime = req.body;

	console.log('Incoming beacon data');

	const trip = {
		beaconSent: requestTime,
		beaconReceived: receivedTime
	};
	roundtrips.push(trip);
	console.log(`Current roundtrips data: ${JSON.stringify(roundtrips)}`);
	res.end();
});

module.exports = router;
