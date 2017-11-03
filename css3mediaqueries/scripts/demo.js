(function () {
	'use strict';
	//Grab the photo containers
	var tulips = document.getElementById('tulipsphotos');
	var eagle = document.getElementById('eaglephotos');
	var grandfather = document.getElementById('grandfatherphotos');
	var pink = document.getElementById('pinkphotos');
	//grandfather.prototype.innerHTML = function(){alert('calledit!');};

	var updateImages = function (mql) {
		//Are we on a large sreen? If so, show big images. Otherwise, show small.
		if (!mql.matches) {
			eagle.firstChild.src = 'images\\eagle2.jpg';
			eagle.firstChild.alt = 'Alexander Calder\'s sculpture the Eagle at dusk, looking out on Eliot bay, lots of people around it.';
			pink.firstChild.src = 'images\\pink_house2.jpg';
			pink.firstChild.alt = 'Pink house with white filagree trim.  Some trim in darker shade of pink';
			grandfather.firstChild.src = 'images\\grandfather_mountain2.jpg';
			grandfather.firstChild.alt = 'huge old yellow street sign which says Grandfather Mountain 6 miles left.';
			tulips.firstChild.src = 'images\\tulips2.jpg';
			tulips.firstChild.alt = 'huge field of red tulips with mountains in the background';

		} else {
			eagle.firstChild.src = 'images\\eagle_small.jpg';
			eagle.firstChild.alt = 'closeup of Calder\'s sculpture the Eagle';
			pink.firstChild.src = 'images\\pink_house_small.jpg';
			pink.firstChild.alt = 'closeup of pink house with white filagree trim.';
			grandfather.firstChild.src = 'images\\grandfather_mountain_small.jpg';
			grandfather.firstChild.alt = 'closeup of huge old street sign to Grandfather Mountain';
			tulips.firstChild.src = 'images\\tulips_small.jpg';
			tulips.firstChild.alt = 'huge field of red tulips with mountains in the background';
		}
	};

	var setupMQL = function () {
		//Account for known vendor prefixes
		if (window.msMatchMedia) {
			window.matchMedia = window.msMatchMedia;
		}
		//Do some feature detection
		if (!window.matchMedia) {
			//MQL isn't supported, download all the images and revert to just CSS3 Media Query style rules to toggle visibility
			eagle.innerHTML = '<img class=\'bigPhoto\' src=\'images\\eagle2.jpg\' alt=\'Alexander Calder\'s sculpture the Eagle at dusk, looking out on Eliot bay, lots of people around it.\' />\n<img class=\'smallPhoto\" src=\'images\\eagle_small.jpg\' alt=\'closeup of Calder\'s sculpture the Eagle\' />';
			pink.innerHTML = '<img class=\'bigPhoto\' src=\'images\\pink_house2.jpg\' alt=\'Pink house with white filagree trim.  Some trim in darker shade of pink\' /><img class=\'smallPhoto\' src=\'images\\pink_house_small.jpg\' alt=\'closeup of pink house with white filagree trim.\' />';
			grandfather.innerHTML = '<img class=\'bigPhoto\' src=\'images\\grandfather_mountain2.jpg\' alt=\'huge old yellow street sign which says Grandfather Mountain 6 miles left.\' /><img class=\'smallPhoto\' src=\'images\\grandfather_mountain_small.jpg\' alt=\'closeup of huge old street sign to Grandfather Mountain\' />';
			tulips.innerHTML = '<img class=\'bigPhoto\' src=\'images\\tulips2.jpg\' alt=\'huge field of red tulips with mountains in the background\' /><img class=\'smallPhoto\' src=\'images\\tulips_small.jpg\' alt=\'closeup of a tulip surrounded by other tulips\' />';
		} else {

			//Create the image elements
			eagle.appendChild(document.createElement('img'));
			pink.appendChild(document.createElement('img'));
			grandfather.appendChild(document.createElement('img'));
			tulips.appendChild(document.createElement('img'));

			//MQL is supported, let's see what size image we should download first
			var mobileMQL = window.matchMedia('(max-width:450px)');

			//Populate the images with the right sources/alt-text for the current state of the media
			updateImages(mobileMQL);
			//Now that we've loaded the initial images, set up listeners to change to the other sizes if the media query changes evaluation
			mobileMQL.addListener(updateImages);
		}
	};

	//Don't get in the way of page load
	window.addEventListener('load', setupMQL, false);
}());
