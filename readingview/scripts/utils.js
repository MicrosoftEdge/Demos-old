/*globals $*/
/* Author: Bonnie Yu, @Microsoft Coporation 2013
 Contains helper functions to support Reading View Test Drive
 */
var ReadingView = ReadingView || {};
ReadingView.utils = ReadingView.utils || {};

(function () {
	'use strict';

	ReadingView.utils.showInfo = function ($ele) {
		//given a jQuery object position it to the front layer
		$ele.css('zIndex', 2);
		$ele.css('opacity', 1);
	};

	ReadingView.utils.hideInfo = function ($ele) {
		//given a jQuery object position it to the back so user cannot accidentally interact with it
		$ele.css('zIndex', -1);
		$ele.css('opacity', 0);
	};

	ReadingView.utils.getPosition = function (ele) {
		//return a coordinate object with top and left
		return {
			top: ele.offsetTop,
			left: ele.offsetLeft
		};
	};

	ReadingView.utils.setInfoH = function (ele) {
		//sets the infobox below the ele
		//require: position sticks on scrolling
		var coordObj = ReadingView.utils.getPosition(ele);
		var info = document.getElementById('info-h');
		var infoTop = coordObj.top + ele.offsetHeight;
		var infoLeft = coordObj.left;

		if (ele.id === 'web-dominant-image') {
			infoTop = coordObj.top + 20;
			infoLeft = coordObj.left + 260;
			info.style.top = infoTop + 'px';
			info.style.left = infoLeft + 'px';
			info.style.width = '400px';
		} else if (ele.id === 'web-inline-image') {
			infoTop = coordObj.top;
			infoLeft = coordObj.left + 330;
			info.style.top = infoTop + 'px';
			info.style.left = infoLeft + 'px';
			info.style.width = '340px';
		} else {
			info.style.top = infoTop + 'px';
			info.style.left = infoLeft + 'px';
		}
		ReadingView.utils.showInfo($('#info-h'));
	};

	ReadingView.utils.setInfo = function (ele) {
		//given an article element from Reading View,
		//update the position and of the Reading View info box
		var coordObj = ReadingView.utils.getPosition(ele);
		var info = document.getElementById('info-rv');
		var paddingWidth = 20;
		var infoLeft;
		var infoTop;

		if (ele.id === 'td-copyright') {
			infoLeft = 2333;
			infoTop = 215;
			info.style.width = '385px';
		} else if (ele.id === 'td-inline-image' || ele.id === 'td-fig-caption') {
			infoLeft = coordObj.left + ele.offsetWidth + paddingWidth;
			infoTop = coordObj.top;
			info.style.width = '295px';
		} else {
			infoLeft = 475;
			infoTop = 80;
			info.style.width = '295px';
		}

		info.style.top = infoTop + 'px';
		info.style.left = infoLeft + 'px';

		ReadingView.utils.showInfo($('#info-rv'));
	};

	// -------------------------- Left NavBar ------------------------------------------//

	ReadingView.utils.clearLeftNav = function () {
		//remove any clicked highlight from the left nav bar
		var ids = ReadingView.data.navBarElementsIDs;
		for (var i = 0, li = ids; i < li; i++) {
			var jQueryNavID = '#' + ids[i];
			ReadingView.utils.unhighlightNav($(jQueryNavID));
		}

		//reset the Nav ID
		ReadingView.data.clickedNavID = '';
	};

	ReadingView.utils.highlightNav = function ($ele) {
		//remove the highlight
		$ele.css('background-color', '#bee7fa');
		$ele.css('color', '#00a3ef');
	};

	ReadingView.utils.highlightClickNav = function (ele) {
		ele.style.background = '#00a3ef';
		ele.style.color = '#a5def9';
	};

	ReadingView.utils.unhighlightNav = function ($ele) {
		$ele.css('background-color', 'white');
		$ele.css('color', '#00a3ef');
	};

	// -------------------------- Reading View Pane ------------------------------------------//

	ReadingView.utils.highlight = function (ele) {
		ele.style.opacity = '1';
	};

	ReadingView.utils.unhighlight = function (ele) {
		ele.style.opacity = '0';
	};

	// -------------------------- Web View Pane ------------------------------------------//
	ReadingView.utils.highlightH = function (ele) {
		//highlight the current page element
		ele.style.border = '3px solid #004999';
	};

	ReadingView.utils.unhighlightH = function (ele) {
		//remove the highlight from the WebView element
		ele.style.border = '3px solid white';
	};
}());
