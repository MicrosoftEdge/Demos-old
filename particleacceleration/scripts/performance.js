/*global sceneWidth, sceneHeight*/
var Performance = function () {
	'use strict';

	// Browser Information
	this.browserCheck = '';
	this.browserName = '';
	this.browserVersion = '';
	this.browserTransform = '';

	// Performance Dashboard
	this.canvas = null;
	this.context = null;
	this.displayDashboard = false;

	// Runtime Performance Information
	this.startTime = 0;
	this.drawCount = 0;
	this.startDrawingTime = 0;
	this.stopDrawTime = 0;
	this.previousStopDrawTime = 0;
	this.currentDrawTime = 0;
	this.delta = 0;
	this.rollingAverageDrawTime = '';
	this.rollingAverageCounter = 0;
	this.rollingAverageSum = 0;
	this.rollingAverageFPS = 0;
	this.rollingAveragePercent = 0;
	this.rollingAverageCallbackEfficiencyPercent = 0;
	this.rollingAverageCallback = 0;
	this.callbackEfficiency = 0;
	this.callbackInstances = 0;

	// Debug Information
	this.debugText = '';

	this.initialize = function () {
		this.startTime = new Date();

		this.canvas = document.getElementById('performance-canvas');
		this.context = this.canvas.getContext('2d');
		this.resize();
	};

	this.resize = function () {
		this.canvas.setAttribute('width', sceneWidth);
		this.canvas.setAttribute('height', sceneHeight - 45);
		this.canvas.style.top = (sceneHeight - 45) + 'px';
	};

	this.beginTrending = function () {
		this.previousStopDrawTime = new Date();
	};

	this.beginDrawLoop = function () {
		this.startDrawingTime = new Date();
	};

	this.finishDrawLoop = function () {
		var now = new Date();
		this.stopDrawTime = now.valueOf();
		this.currentDrawTime = this.stopDrawTime - this.startDrawingTime.valueOf();
		this.delta = Math.floor(this.stopDrawTime - this.previousStopDrawTime - 17);
		if (this.delta > 0) {
			this.currentDrawTime += this.delta;
		}
		this.previousStopDrawTime = this.stopDrawTime;
		this.drawCount++;
		this.rollingAverageCallback += (this.callbackEfficiency * 100);

		this.rollingAverageCounter++;
		this.rollingAverageSum += this.currentDrawTime;
		if (this.rollingAverageCounter === 32) {
			this.rollingAverageDrawTime = this.rollingAverageSum / this.rollingAverageCounter;
			this.rollingAverageCounter = 0;
			this.rollingAverageSum = 0;
			this.rollingAveragePercent = Math.min((1000 / this.rollingAverageDrawTime / 60), 1);

			// Provide a 5% buffer around the 16.7ms rolling average to account for clock skew
			// and other variables which could destabalize the number. This keeps the number more
			// stable once we've reached the equilibrium.
			this.rollingAverageFPS = Math.min(1000 / this.rollingAverageDrawTime, 60);
			this.rollingAverageFPS = (this.rollingAverageFPS < (60 * 0.95)) ? this.rollingAverageFPS : 60;
			this.rollingAverageCallbackEfficiencyPercent = this.rollingAverageCallback / this.callbackInstances;
		}
	};

	this.drawDashboard = function () {
		this.context.clearRect(0, 0, sceneWidth, sceneHeight - 32);

		var message = '     Window Size: ' + sceneWidth + 'x' + sceneHeight;
		// Provide a 5% buffer around the 16.7ms rolling average to account for clock skew
		// and other variables which could destabalize the number. This keeps the number more
		// stable once we've reached the equilibrium.
		if (this.rollingAverageDrawTime > 15.865 && this.rollingAverageDrawTime < 17.535) {
			message += '     DrawTime: 16.7ms';
			message += '     FPS: 60';
			message += '     Percent: 100%';
		} else {
			message += '     DrawTime: ' + Math.floor(this.rollingAverageDrawTime) + 'ms';
			message += '     FPS: ' + Math.min(Math.floor(this.rollingAverageFPS), 60);
			message += '     FPS Percent: ' + Math.round(this.rollingAveragePercent * 100) + '%';
			message += '     Callback Efficiency: ' + Math.round(this.rollingAverageCallbackEfficiencyPercent * 100) / 100 + '%';
			message += '     Score: ' + Math.round(this.rollingAverageCallbackEfficiencyPercent * 100 * Math.min(Math.floor(this.rollingAverageFPS), 60));
		}

		this.context.fillStyle = '#00000';
		this.context.font = '9pt Segoe UI';
		this.context.textAlign = 'left';
		this.context.fillText(message, 0, 18);
	};

	this.show = function () {
		this.displayDashboard = true;
	};

	this.Hide = function () {
		this.displayDashboard = false;
	};

	this.toggleVisibility = function () {
		this.displayDashboard = (this.displayDashboard === true) ? false : true;
	};

	this.initialize();
};
