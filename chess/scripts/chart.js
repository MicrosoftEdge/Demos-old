(function(app, $) {
	'use strict';

	// total number of values that are stored in the chart cache
	const defaults = {

		// the width of an individual bar in pixels
		barWidth: 2,

		// the space between bars in pixels
		barGap: 2,

		// the max value for the y axis
		initMaxValue: 100,

		// the increment at which to grow the max value (0 will prevent it from changing)
		maxValueIncrement: 10,

		// callback when the max value changes
		maxValueChanged: null,

		// the minimum height of any bar
		zeroBarHeight: 0,

		// the minimum number of values combined into a group
		minGroupSize: 1,

		// the colors, of the bars in the back
		colors: [
			'#0078D7',
			'#E0E0E0'
		]
	};

	/*eslint-disable func-style*/
	function Chart(canvas, options) {
	/*eslint-enable func-style*/
		if (!canvas) {
			return;
		}

		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');

		// array of arrays containing all values
		this.valueSets = [];

		// total number of values in each array
		this.valuesCount = 0;

		this.options = $.extend({}, defaults, options);
		this.maxValue = this.options.initMaxValue;

		this.resize();
	}

	Chart.prototype.updateOptions = function(options) {
		this.options = $.extend({}, this.options, options);
	};

	Chart.prototype.resize = function() {
		this.canvas.width = this.canvas.offsetWidth;
		this.canvas.height = this.canvas.offsetHeight;
	};

	// accepts 1...n arguments, each of which will get rendered as
	// a separate layer in the chart
	Chart.prototype.pushValues = function() {
		while (this.valueSets.length < arguments.length) {
			const values = this.valuesCount === 0 ? [] :
				Array.apply(null, Array(this.options.valuesCount)).map(Number.prototype.valueOf, 0);
			this.valueSets.push(values);
		}

		for (let i = 0; i < arguments.length; i++) {
			const val = arguments[i] ? arguments[i] : 0;
			this.valueSets[i].push(val);

			if (val > this.maxValue) {
				if (this.options.maxValueIncrement > 0) {
					let max = this.maxValue;
					while (max < val) {
						max += this.options.maxValueIncrement;
					}
					this.maxValue = max;
				}

				if (this.options.maxValueChanged) {
					this.options.maxValueChanged(this.maxValue);
				}
			}
		}

		this.valuesCount++;
		this.render();
	};

	Chart.prototype.drawBar = function(fill, x, y, height) {
		this.ctx.fillStyle = fill;
		this.ctx.fillRect(x, this.canvas.height - (height + y), this.options.barWidth, height);
	};

	Chart.prototype.groupValues = function(vals, groupCount) {
		if (groupCount === 0) {
			return [];
		}

		const groupedVals = [];

		let groupSize = this.valuesCount <= (groupCount * this.options.minGroupSize) ?
				this.options.minGroupSize :
				this.valuesCount / groupCount,
			groupSum = 0,
			groupBreak = Math.round(groupSize) - 1,
			lastBreakIndex = -1;

		for (let i = 0; i < this.valuesCount; i++) {
			groupSum += vals[i];
			if (i >= groupBreak || i === this.valuesCount - 1) {
				let sinceLastBreak = i - lastBreakIndex,
					groupAverage = groupSum / sinceLastBreak;

				groupedVals.push(groupAverage);
				groupBreak += groupSize;
				groupSum = 0;
				lastBreakIndex = i;
			}
		}

		return groupedVals;
	};

	Chart.prototype.render = function() {
		this.resize();
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		const groupCount = Math.floor((this.canvas.width - this.options.barGap) / (this.options.barWidth + this.options.barGap)) + 1;

		for (let v = 0; v < this.valueSets.length; v++) {
			let x = 0,
				groupedVals = this.groupValues(this.valueSets[v], groupCount),
				color = this.options.colors[v % this.valueSets.length];

			for (let i = 0; i < groupedVals.length; i++) {
				let val = groupedVals[i],
					height = (val / this.maxValue) * this.canvas.height;

				this.drawBar(color, x, 0, height);
				x += (this.options.barWidth + this.options.barGap);
			}
		}
	};

	app.Chart = Chart;
}(window.ChessDemo, window.jQuery));
