(function () {
	'use strict';

	function toSuperscript(t) {
		return String(t).split('').map(Number).map(superNum).join('');
	}

	function superNum(c) {
		if (c === 1) { return String.fromCharCode(0x00b9); }
		if (c === 2 || c === 3) { return String.fromCharCode(0x00b0 + c); }
		return String.fromCharCode(0x2070 + c);
	}

	var margin = {
		top: 100,
		right: 100,
		bottom: 100,
		left: 100
	};

	var width = 1200;
	var height = 600;

	var totalWidth = width + margin.left + margin.right;
	var totalHeight = height + margin.top + margin.bottom;

	var legendItems = 0;
	var legendLine = d3.svg.line();

	function graph(id, series) {
		legendItems = 0;

		// create svg
		var svg = d3.select(id).append('svg')
			.attr('width', totalWidth)
			.attr('height', totalHeight)
			.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		// scales
		var x = d3.scale.linear()
			.domain([10, 50])
			.range([0, width]);

		var y = d3.scale.pow()
			.domain([0, Math.pow(10, -8)])
			.range([height, 0])
			.exponent(0.025);

		var relativeErrorY = d3.scale.pow()
			.domain([0, 1])
			.range([height, 0])
			.exponent(0.5);

		// x axis
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient('bottom')
			.tickFormat(function (d) { return '10\u207b' + toSuperscript(d); });

		svg.append('g')
			.attr('transform', 'translate(0,' + height + ')')
			.attr('class', 'axis')
			.call(xAxis);

		// y axis
		var ys = [0].concat(d3.range(8, 22, 2)).concat(d3.range(25, 35, 5));
		var yValues = ys.map(function (d) { return Math.pow(10, -d); });
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient('left')
			.tickValues(yValues)
			.tickFormat(function (d) {
				if (d === 1 || d === 0) { return d; }

				return '10\u207b' + toSuperscript(-Math.log10(d));
			});

		svg.append('g')
			.attr('class', 'axis')
			.call(yAxis);

		// relative error axis
		var relAxis = d3.svg.axis()
			.scale(relativeErrorY)
			.orient('right')
			.tickFormat(d3.format('.0%'))

		svg.append('g')
			.attr('transform', 'translate(' + width + ', 0)')
			.attr('class', 'axis')
			.call(relAxis);

		// graph lines
		var line = d3.svg.line()
			.x(function (d) { return x(d[0]); })
			.y(function (d) { return y(d[1]); });

		series.forEach(function (s, i) {
			addGraph(svg, 'line' + i, line, s.map);
		});

		// relative error line
		var relLine = d3.svg.line()
			.x(function (d) { return x(d[0]); })
			.y(function (d) { return relativeErrorY(d[1]); });

		addGraph(svg, 'line2', relLine, function(d) {
			return Math.abs((series[1].map(d) - series[0].map(d)) / series[0].map(d));
		})

		// legend
		var legend = svg.append('g')
			.attr('transform', 'translate(' + 0 + ',-75)');

		legend.append('rect')
			.attr('y', '-25')
			.attr('x', '-25')
			.attr('width', 325)
			.attr('height', 75)
			.attr('fill', 'white');

		series.forEach(function (s, i) {
			addLegend(legend, s.name, 'line' + i);
		});

		addLegend(legend, "Relative Error", "line2");

		// axis labels
		addLabels(svg);
	}

	function addGraph(svg, klass, line, fn) {
		svg.append('g')
			.append('path')
				.datum(d3.range(10, 50, 0.001).map(function (d) { return [d, fn(d)]; }))
				.attr('class', klass)
				.attr('d', line);
	}

	function addLabels(svg) {
		svg.append('text')
			.text('Input Value')
			.attr('transform', 'translate(' + (width / 2) + ', ' + (height + 50) + ')')
			.attr('text-anchor', 'middle')
			.attr('class', 'axis-label');

		svg.append('text')
			.text('Result')
			.attr('transform', 'translate(-50, ' + height / 2 + ')rotate(-90)')
			.attr('text-anchor', 'middle')
			.attr('class', 'axis-label');

		svg.append('text')
			.text('Relative Error')
			.attr('transform', 'translate(' + (width + 50) + ',' + height / 2 + ')rotate(90)')
			.attr('text-anchor', 'middle')
			.attr('class', 'axis-label');
	}

	function addLegend(container, name, klass) {
		var legendItem = container.append('g')
			.attr('transform', 'translate(0, ' + (legendItems++ * 25) + ')')

		legendItem.append('path')
			.datum([[0, 0], [50, 0]])
			.attr('class', klass + ' legend')
			.attr('d', legendLine);

		legendItem.append('text')
			.attr('transform', 'translate(60, 0)')
			.attr('dy', '0.25em')
			.text(name);
	}


	function log1p(id) {
		graph(id, [
			{ name: 'Math.log1p(x)', map: function (x) { return Math.log1p(Math.pow(10, -x));}},
			{ name: 'Math.log(1 + x)', map: function (x) { return Math.log(1 + Math.pow(10, -x));}}
		]);
	}

	function expm1(id) {
		graph(id, [
			{ name: 'Math.expm1(x)', map: function (x) { return Math.expm1(Math.pow(10, -x)); } },
			{ name: 'Math.pow(Math.E, x) - 1', map: function (x) { return Math.pow(Math.E, Math.pow(10, -x)) - 1; }}
		]);
	}

	if(Math.log1p && Math.expm1) {
		log1p('#log1p-demo');
		expm1('#expm1-demo');
	} else {
		var message = "<h3>Your browser does not implement Math.log1p or Math.expm1. Please try in a browser that has these implemented.</h3>";

		document.getElementById('log1p-demo').innerHTML = message;
		document.getElementById('expm1-demo').innerHTML = message;
	}
}());
