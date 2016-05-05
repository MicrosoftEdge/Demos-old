//  How many tags should we have if the user doesn't specify in a query string?
var DEFAULT_NUM_TAGS = 75;
//  Which div id should we put the tags in?
var TAGS_DIV = 'sidebar';
// How fast do we want the page to load?
var LOADING_GOAL_TIME_MS = 500;

var startMeasurePerf = function() {
	'use strict';
	// Start the clock for loading time
	performance.mark('script begin');
	if (window.msWriteProfilerMark) {
		window.msWriteProfilerMark('script begin');
	}
};

// Sets all the given divs to default width and height
var resetDivs = function (divs) {
	'use strict';
	for (var i = 0; i < divs.length; i++) {
		divs[i].style.width = '';
		divs[i].style.height = '';
	}
};

// This function essentially re-implements css flexbox logic using inefficient javascript code. It takes all divs in the given
// element, assumes they're inline, and modifies their widths so they fill whichever row they're on.
var setWidthOfCells = function (divId) {
	'use strict';
	var mainContent = document.getElementById(divId);
	var cells = mainContent.getElementsByTagName('div');

	// First, reset all the divs to their default width and height
	resetDivs(cells);

	// For every row
	for (var i = 0; i < cells.length; i++) {
		// This is giving us 'for every row', because we'll only enter this 'if' for the tags on the far left side
		if (cells[i].offsetLeft === 0) {
			var cellsInRow = [];
			var totalWidth = 0;

			// Get the list of divs that are in this row, and simultaneously count up their total width
			for (var j = 0; j < cells.length; j++) {
				// If this cell is in the same row as the one on the left side...
				if (cells[j].offsetTop === cells[i].offsetTop) {
					// ...add it to our list of cells in this row, and add its width to the total width of cells in the row
					cellsInRow.push(cells[j]);
					totalWidth += cells[j].offsetWidth;
				}
				// This nested loop is missing a few optimizations (start j at i, break the loop as soon as [j].height > [i].height...)
				// We're intentionally stressing the browser with inefficient javascript. Here, we'll make it especially bad by
				// invalidating the layout inside this loop. This line really just exists to emphasise the perf impact of this function
				cells[j].style.height = cells[j].offsetHeight;
			}
			// cellsInRow[] now contains all the tags that are in the current row

			// Now expand all the tags in this row so that they fill the horizontal space.
			// Get the new widths by solving for x: currentWidthOfTag / currentTotalWidthOfTagsOnRow = x / containingDivWidth
			for (var k = 0; k < cellsInRow.length; k++) {
				cellsInRow[k].style.width = (((cellsInRow[k].offsetWidth * document.getElementById(divId).offsetWidth) / totalWidth) - 1 + 'px');
			}
		}
	}
};

// Returns a string with a random cheesy hashtag. Not really important to the demo
var randomText = function () {
	'use strict';
	var text = '#';
	var possible = ['Spectacular', 'Epic', 'Fortitude', 'Impressive', 'Demonstration', 'Edge', 'Microsoft', 'Awesome', 'Synergy', 'Nifty', 'Wonderful', 'Wow', 'MindBlowing', 'Love', 'Great'];

	for (var i = 0; i < Math.random() * 2; i++) {
		text += possible[Math.floor(Math.random() * possible.length)];
	}

	return text;
};

// Returns how many tags we should create on the left. The user can use a query string in the URL to specify the number of hastags with '?tags=120' (or any number)
// If they don't, we just return the default, specified at the top of this script block. The code in this function isn't very important to the demo
var getNumTags = function () {
	'use strict';
	var url = window.location.href.toLowerCase();
	var regex = new RegExp('[?&]tags(=([^&#]*)|&|#|$)');
	var results = regex.exec(url);

	if (results === null || !results[2]) {
		return DEFAULT_NUM_TAGS;
	}

	return parseInt(results[2]);
};

// Create the hash tags for the blog articles and format them to fill the sidebar
var initializeHashtags = function () {
	'use strict';

	// Add all of the hash tags to the document
	for (var i = 0; i < getNumTags(); i++) {
		// create a div for each tag
		var tag = document.createElement('div');

		// Give the tag an id and class
		tag.id = 'tag-' + i;
		tag.classList.add('tag');

		// Give it some random hashtag text
		tag.innerHTML = '<p>' + randomText() + '</p>';

		// Add the tag to the sidebar
		document.getElementById(TAGS_DIV).appendChild(tag);

		// After all of the tags are added, set the width for all of them
		setWidthOfCells(TAGS_DIV);
	}
};

var attachResize = function () {
	'use strict';
	// Also, we need to redo that work when the browser is resized
	window.onresize = function resize() {
		setWidthOfCells(TAGS_DIV);
	};
};

var stopMeasurePerf = function () {
	'use strict';
	if (window.msWriteProfilerMark) {
		window.msWriteProfilerMark('script end');
	}
	performance.mark('script end');
	performance.measure('script', 'script begin', 'script end');
};

var outputPerfResults = function () {
	'use strict';
	var measurePerf = function () {
		var afterOnLoad = function () {
			// Measure how long it took to execute this script on load
			var duration = performance.getEntriesByName('script')[0].duration;

			var scriptCostElement = document.getElementById('scriptTime');
			var navCostElement = document.getElementById('navTime');

			// Now display the time it took to load on the page itself
			scriptCostElement.innerText = duration.toFixed(2);
			navCostElement.innerText = performance.getEntriesByType('navigation')[0].duration.toFixed(2);
			if (duration > LOADING_GOAL_TIME_MS) {
				scriptCostElement.className += ' failed';
				navCostElement.className += ' failed';
			} else {
				scriptCostElement.className += ' passed';
				navCostElement.className += ' passed';
			}
		};

		setTimeout(afterOnLoad);
	};

	window.addEventListener('load', measurePerf);
};

var runOnParse = function () {
	'use strict';
	startMeasurePerf();

	// Make a bunch of hashtags on the left sidebar ...with expensive inline blocking script
	initializeHashtags();

	attachResize();

	stopMeasurePerf();

	outputPerfResults();
};

runOnParse();