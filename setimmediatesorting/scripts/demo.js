/**
 *  Thanks to Erik Kay and Mike Belshe from the Google Chrome engineering team who originally
 *  wrote the below sorting test. This test is a great way to experience the patterns across
 *  JavaScript timer resolutions and CPU efficiency. Plus it's fun to visualize algorithms
 *  and think back to Computer Science class. Thanks guys!
 *
 *  We made a few minor changes to showcase the proposed setImmediate API benefits.
 *  1) Run test in HTML5 Standards mode instead of Quirks mode.
 *  2) Added CSS unit descriptors for CSS compliance (and to eliminate error codepaths).
 *  3) Refactored callbacks to a single location to simplify learning about setImmediate.
 *  4) Added concept of setImmedate to the callbacks.
 *  5) Only run one test at a time which removes observer effect from second test.
 *  6) Use CSS3 transforms which removes layout/formatting observer effect.
 *  7) Implemented three hard coded tests for simplicity rather than dynamic values.
 *  8) Randomly generate during page load and then reuse the same array for all three tests.
 *  9) Changed the color scheme and styles of the test to match the IE TestDrive theme.
 **/
(function () {
	'use strict';
	var manual = 0;
	var size = 250;
	var browserTransformDOM, browserTransformCSS, browserSupportsSetImmediate,
		sort;

	(function polyfill() {
		var style = document.createElement('div').style;
		var prefixes = ['Webkit', 'Moz', 'O'];

		if ('transform' in style) {
			browserTransformDOM = 'transform';
			browserTransformCSS = 'transform';
		} else {
			for (var i = 0, l = prefixes.length; i < l; i++) {
				var transform = prefixes[i] + 'Transform';
				if (transform in style) {
					browserTransformDOM = transform;
					browserTransformCSS = '-' + prefixes[i].toLowerCase() + '-' + 'transform';
					continue;
				}
			}
		}

		if ('msSetImmediate' in window && !('setImmediate' in window)) {
			window.setImmediate = window.msSetImmediate;
		}

		browserSupportsSetImmediate = 'setImmediate' in window;
	}());

	var Sort = function (name, intervalTime, func) {
		this.name = name;
		this.func = func;
		this.results = null;
		this.powerConsumption = null;
		this.CPUEfficency = null;
		this.size = size;
		this.compareX = null;
		this.compareY = null;
		this.compares = 0;
		this.swapX = null;
		this.swapY = null;
		this.swaps = 0;
		this.startTime = 0;
		this.stopTime = 0;
		this.workQueue = [];
		this.timer = 0;
		this.lastTime = 0;
		this.numIterations = 0;
		this.numJobs = 0;
		this.overheadMin = 1000000;
		this.overheadMax = 0;
		this.processingMin = 1000000;
		this.processingMax = 0;
		this.stepMin = 1000000;
		this.intervalTime = intervalTime;

		this.setup();
	};

	Sort.prototype.setup = function () {
		this.size = size;
		this.bars = new Array(this.size);
		for (var i = 0; i < this.size; i++) {
			this.bars[i] = {elem: '', value: i + 1, left: ''};
		}
		for (i = 0; i < this.size; i++) {
			var r = Math.floor(Math.random() * this.bars.length);
			if (i !== r) {
				var tmp = this.bars[i].value;
				this.bars[i].value = this.bars[r].value;
				this.bars[r].value = tmp;
			}
		}

		this.barsOriginal = this.bars.slice(0);
	};

	Sort.prototype.stepper = function () {
		var t = new Date();
		var overhead = t - this.lastTime;
		this.overheadMin = Math.min(this.overheadMin, overhead);
		this.overheadMax = Math.max(this.overheadMax, overhead);
		this.lastTime = t;

		var ops = 0;
		var count = this.workQueue.length;
		if (count > 0) {
			var func = this.workQueue.pop();
			ops++;
			this.numJobs++;
			func();
		}

		t = new Date();

		var processing = t - this.lastTime;
		this.processingMin = Math.min(this.processingMin, processing);
		this.processingMax = Math.max(this.processingMax, processing);
		var stepTime = processing + overhead;
		this.stepMin = Math.min(this.stepMin, stepTime);
		this.numIterations++;
		this.lastTime = new Date();

		if (ops === 0) {
			this.finished();
		}
		else {
			this.registerCallback();
		}
	};

	Sort.prototype.addWork = function (work) {
		this.workQueue.push(work);
	};

	Sort.prototype.init = function () {
		this.print();
	};

	Sort.prototype.reset = function () {
		this.stop();
		this.startTime = 0;
		this.stopTime = 0;
		this.bars = this.barsOriginal.slice(0);
		this.print();
	};

	Sort.prototype.startSetTimeout15 = function () {
		this.useSetImmediate = false;
		this.usePostMessage = false;
		this.intervalTime = 15;
		this.results = document.getElementById('HTML4TestResuts');
		this.powerConsumption = '<span style="color:#107C10;">Standard</span>';
		this.CPUEfficency = '<span style="color:#F03A17;">Low</span>';
		this.reset();
		this.start();
	};

	Sort.prototype.startSetTimeout0 = function () {
		this.useSetImmediate = false;
		this.usePostMessage = false;
		this.intervalTime = 4;
		this.results = document.getElementById('HTML5TestResults');
		this.powerConsumption = '<span class="test-result--bad">High</span>';
		this.CPUEfficency = '<span class="test-result--neutral">Medium</span>';
		this.reset();
		this.start();
	};

	Sort.prototype.startPostMessage = function () {
		this.useSetImmediate = false;
		this.usePostMessage = true;
		this.results = document.getElementById('postMessageTestResults');
		this.powerConsumption = '<span class="test-result--neutral">Medium</span>';
		this.CPUEfficency = '<span class="test-result--good">High</span>';
		this.reset();
		this.start();
	};

	Sort.prototype.startSetImmediate = function () {
		this.useSetImmediate = true;
		this.usePostMessage = false;
		this.intervalTime = 4;
		this.results = document.getElementById('setImmediateTestResults');
		this.powerConsumption = '<span class="test-result--good">Low</span>';
		this.CPUEfficency = '<span class="test-result--good">High</span>';
		this.reset();

		if (browserSupportsSetImmediate === false) {
			document.getElementById('setImmediateTestButton').disabled = true;
			document.getElementById('setImmediateTestResults').innerHTML = '<span>Your browser does not currently support the setImmediate API, an emerging specification in the <a href="http://www.w3.org/2010/webperf/">W3C Web Performance Working Group</a>.</span>';
		}
		else {
			this.start();
		}
	};

	Sort.prototype.start = function () {
		if (this.startTime > 0) {
			if (this.stopTime > 0) {
				this.startTime = 0;
				this.stopTime = 0;
				return;
			} else if (manual) {
				this.stepper();
				return;
			} else {
				this.finished();
				return;
			}
		}
		if (!manual) {
			this.registerCallback();
		}
		this.compares = 0;
		this.swaps = 0;
		this.startTime = (new Date()).getTime();
		this.lastTime = this.startTime;
		this.numJobs = 0;
		this.stopTime = 0;
		this.overheadMin = 1000000;
		this.overheadMax = 0;
		this.processingMin = 1000000;
		this.processingMax = 0;
		this.numIterations = 0;
		this.func(this);
	};

	Sort.prototype.registerCallback = function () {
		var that = this;

		if (this.useSetImmediate) {
			this.timer = window.setImmediate(function () {
				that.stepper();
			});
		}
		else if (this.usePostMessage) {
			if (!this.listening) {
				addEventListener('message',
					function (event) {
						//If you are going to implement this method you should check the origin
						if (event.data === 'stepforward') {
							that.stepper();
						}
					}, false);
				this.listening = true;
			}

			postMessage('stepforward', window.location.href);
		}
		else {
			this.timer = setTimeout(function () {
				that.stepper();
			}, this.intervalTime);
		}
	};

	Sort.prototype.cleanup = function () {
		if (this.compareX) {
			this.compareX.elem.style.borderColor = 'black';
			this.compareY.elem.style.borderColor = 'black';
		}
		if (this.swapX) {
			this.swapX.elem.style.backgroundColor = '#107C10';
			this.swapY.elem.style.backgroundColor = '#107C10';
		}
		this.workQueue = [];
	};

	Sort.prototype.stop = function () {
		if (this.timer !== 0) {
			this.timer = 0;
		}
		this.cleanup();
	};

	Sort.prototype.finished = function (err) {
		this.stop();

		this.stopTime = (new Date()).getTime();

		var total = (this.stopTime - this.startTime);
		if (err == null) {
			this.results.innerHTML = 'Time Required: ' + total + 'ms' + '<br/>' + 'Power Consumption: ' + this.powerConsumption + '<br/>' + 'CPU Efficency: ' + this.CPUEfficency;
		}
	};

	Sort.prototype.print = function () {
		var graph = document.getElementById(this.name);
		var text = '';
		var len = this.bars.length;
		var heightMultiple = (graph.clientHeight - 20) / len;
		var width = 3;
		var leftOffset = Math.round((graph.clientWidth - ((width + 1) * len)) / 2);
		for (var i = 0; i < len; i++) {
			var val = this.bars[i].value;
			var height = Math.max(1, Math.floor(val * heightMultiple));
			var left = leftOffset + (i * (width + 1));
			this.bars[i].left = left;
			text += '<div class="bar" style="border: 1px solid black; height:' + height + 'px; width:' + width + 'px; ' + browserTransformCSS + ':translate(' + left + 'px, 0px);"' + ' id="' + this.name + val + '" value="' + val + '"></div>';
		}

		graph.innerHTML = text;
		var nodes = document.getElementsByClassName('bar');
		var j = 0;
		for (i = 0; i < nodes.length; i++) {
			var name = nodes[i].id;
			if (name.indexOf(this.name) === 0) {
				this.bars[j].elem = nodes[i];
				j++;
			}
		}
	};

	Sort.prototype.compare = function (x, y) {
		var bx = this.bars[x];
		var by = this.bars[y];
		if (this.compareX !== bx) {
			this.compareX = bx;
		}
		if (this.compareY !== by) {
			this.compareY = by;
		}
		this.compares++;
		return bx.value - by.value;
	};

	Sort.prototype.swap = function (x, y) {
		var bx = this.bars[x];
		var by = this.bars[y];
		if (this.swapX !== x) {
			if (this.swapX) {
				this.swapX.elem.style.backgroundColor = '#107C10';
			}
			bx.elem.style.backgroundColor = '#0037DA';
			this.swapX = bx;
		}
		if (this.swapY !== y) {
			if (this.swapY) {
				this.swapY.elem.style.backgroundColor = '#107C10';
			}
			by.elem.style.backgroundColor = '#F03A17';
			this.swapY = by;
		}

		var tmp = bx.left;
		bx.left = by.left;
		by.left = tmp;

		bx.elem.style[browserTransformDOM] = 'translate(' + bx.left + 'px, ' + 0 + 'px)';
		by.elem.style[browserTransformDOM] = 'translate(' + by.left + 'px, ' + 0 + 'px)';

		this.bars[x] = by;
		this.bars[y] = bx;

		this.swaps++;
	};

	var partitionStep = function (sort, left, right, pivot, i, j) {
		if (i < right) {
			if (sort.compare(i, right) <= 0) {
				sort.swap(i, j);
				j++;
			}
			i++;
			sort.addWork(function () {
				partitionStep(sort, left, right, pivot, i, j);
			});
		} else {
			sort.swap(j, right);
			sort.addWork(function () {
				sortQuick(sort, left, j - 1);
			});
			sort.addWork(function () {
				sortQuick(sort, j + 1, right);
			});
		}
	};

	var partition = function (sort, left, right, pivot) {
		sort.swap(pivot, right);
		sort.addWork(function () {
			partitionStep(sort, left, right, pivot, left, left);
		});
	};

	// QuickSort Implementation
	var sortQuick = function (sort, left, right) {
		if (arguments.length === 1) {
			left = 0;
			right = sort.size - 1;
		}
		if (left < right) {
			var pivot = left + Math.floor(Math.random() * (right - left));
			partition(sort, left, right, pivot);
		}
	};

	document.getElementById('sort15Button').addEventListener('click', function () {
		sort.startSetTimeout15();
	});

	document.getElementById('sort0Button').addEventListener('click', function () {
		sort.startSetTimeout0();
	});

	document.getElementById('setImmediateTestButton').addEventListener('click', function () {
		sort.startSetImmediate();
	});

	document.getElementById('postMessageTestButton').addEventListener('click', function () {
		sort.startPostMessage();
	});

	sort = new Sort('test-graph', 0, sortQuick);
	sort.init();
}());
