(function(app, $) {
	'use strict';

	var roundToDecimals = function(val, n) {
		var exponent = n || 2;
		return Math.round(val * Math.pow(10, exponent)) / Math.pow(10, exponent);
	};

	var addCommasToNumber = function(n) {
		if (n) {
			var s = n.toString();
			return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		}
	};

	/*eslint-disable func-style*/
	function Match() {
	/*eslint-enable func-style*/
		this.game = new window.Chess();
		this.gameReady = false;
		this.skillLevel = 20;

		this.advantageChart = new app.Chart(document.getElementById('chess--chartAdvantage'), {
			initMaxValue: 1,
			maxValueIncrement: 0,
			minGroupSize: 4,
			colors: [
				'#D0D0D0',
				'#0078D7'
			]
		});

		/*eslint-disable new-cap*/
		this.board = window.ChessBoard('board', {
			position: 'start',
			pieceTheme: 'images/pieces/{piece}.png'
		});
		/*eslint-enable new-cap*/

		this.$boardOverlay = $('#chess--boardOverlay');
		this.$gameDetail = $('#chess--gameDetail');
		this.$startButton = $('#chess--startStopButton');
		this.$startButton.on('click', $.proxy(this.onStartButtonClick, this));

		this.$optionsPanel = $('#chess--options');
		this.$optionsButton = $('#chess--optionsButton');
		this.$optionsButton.on('click', $.proxy(this.onOptionsButtonClick, this));

		this.$p1Stats = $('#chess--p1Stats');
		this.$p2Stats = $('#chess--p2Stats');

		this.$scoreP1Score = $('#chess--scoreP1Score');
		this.$scoreP2Score = $('#chess--scoreP2Score');

		this.$scoreP1Advantage = $('#chess--scoreP1Advantage');
		this.$scoreP2Advantage = $('#chess--scoreP2Advantage');

		this.$gameHistory = $('#chess---gameHistory');

		this.$timePerTurnOptionValue = $('#chess--optionRangeTimePerTurnValue');
		this.$timePerTurnOption = $('#chess--optionRangeTimePerTurn');

		this.$skillLevelOptionValue = $('#chess--optionRangeSkillLevelValue');
		this.$skillLevelOption = $('#chess--optionRangeSkillLevel');

		this.$contemptOptionValue = $('#chess--optionRangeContemptValue');
		this.$contemptOption = $('#chess--optionRangeContempt');

		this.p1Stats = { totalNodes: 0, totalTime: 0, maxDepth: 0, relNodes: 1, currentTurn: null, pWin: 0.5 };
		this.p2Stats = { totalNodes: 0, totalTime: 0, maxDepth: 0, relNodes: 1, currentTurn: null, pWin: 0.5 };

		// create Player 1 (ASM.js optmized)
		this.player1 = new app.Player({
			color: 'b',
			name: 'Player1',
			stockfishUrl: 'scripts/libs/stockfish.js',
			skillLevel: this.skillLevel,
			onReady: this.onPlayerReady.bind(this),
			onInfo: this.onPlayer1Info.bind(this),
			onMove: this.onPlayerMove.bind(this)
		});
		this.player1.startNewGame();

		// create Player 1 (no optimization)
		this.player2 = new app.Player({
			color: 'w',
			name: 'Player2',
			//stockfishUrl: 'scripts/libs/stockfish.js',
			stockfishUrl: 'scripts/libs/stockfish-no-asm.js',
			skillLevel: this.skillLevel,
			onReady: this.onPlayerReady.bind(this),
			onInfo: this.onPlayer2Info.bind(this),
			onMove: this.onPlayerMove.bind(this)
		});
		this.player2.startNewGame();

		this.$timePerTurnOption.on('input change', $.proxy(this.onTimePerTurnOptionChange, this));
		this.$skillLevelOption.on('input change', $.proxy(this.onSkillLevelOptionChange, this));
		this.$contemptOption.on('input change', $.proxy(this.onContemptOptionChange, this));

		// intialize options
		this.setTimePerTurn(200, true);
		this.setSkillLevel(20, true);
		this.setContempt(0, true);
	}

	Match.prototype.resize = function() {
		this.board.resize();
		this.advantageChart.resize();
	};

	Match.prototype.onTimePerTurnOptionChange = function(e) {
		this.setTimePerTurn(e.target.value);
	};

	Match.prototype.setTimePerTurn = function(val, updateRange) {
		this.moveTime = val;
		this.$timePerTurnOptionValue.text(val);
		if (updateRange) {
			this.$timePerTurnOption.attr('value', val);
		}
	};

	Match.prototype.onSkillLevelOptionChange = function(e) {
		this.setSkillLevel(e.target.value);
	};

	Match.prototype.setSkillLevel = function(val, updateRange) {
		this.skillLevel = val;
		this.$skillLevelOptionValue.text(val);
		this.player1.setSkillLevel(this.skillLevel);
		this.player2.setSkillLevel(this.skillLevel);
		if (updateRange) {
			this.$skillLevelOption.attr('value', val);
		}
	};

	Match.prototype.onContemptOptionChange = function(e) {
		this.setContempt(e.target.value);
	};

	Match.prototype.setContempt = function(val, updateRange) {
		this.contempt = val;
		this.$contemptOptionValue.text(val);
		this.player1.setContempt(this.contempt);
		this.player2.setContempt(this.contempt);
		if (updateRange) {
			this.$contemptOption.attr('value', val);
		}
	};

	Match.prototype.onStartButtonClick = function() {
		if (this.gameReady) {
			this.$boardOverlay.fadeOut(500);
			this.startNextTurn();
			this.$gameDetail.show();
		}
	};

	Match.prototype.onOptionsButtonClick = function() {
		this.$boardOverlay.toggleClass('chess--showOptions');
	};

	Match.prototype.onPlayerReady = function() {
		if (this.player1.engineReady && this.player2.engineReady) {
			this.gameReady = true;
		}
	};

	Match.prototype.onPlayer1Info = function(info) {
		this.updateStats(this.$p1Stats, this.p1Stats, info);
		this.updateChart();
	};

	Match.prototype.onPlayer2Info = function(info) {
		this.updateStats(this.$p2Stats, this.p2Stats, info);
		this.updateChart();
	};

	Match.prototype.resetTurnStats = function(stats) {
		stats.currentTurn = { nodes: 0, time: 0, depth: 0 };
	};

	Match.prototype.updateChart = function() {
		if (this.p1Stats && this.p2Stats) {
			this.advantageChart.pushValues(1, this.p1Stats.pWin);
		}
	};

	Match.prototype.updateChartMaxValue = function(maxValue) {
		console.log('new maxValue: ' + maxValue);
	};

	Match.prototype.updateStats = function($stats, stats, info) {
		$stats.empty();

		// figure out the incremental changes since last update
		var dNodes = info.nodes - stats.currentTurn.nodes;
		var dTime = info.time - stats.currentTurn.time;

		stats.totalNodes += dNodes;
		stats.totalTime += dTime;
		stats.maxDepth = Math.max(stats.maxDepth, info.depth);
		stats.currentTurn = info;

		// convert score measured in centipawns to a predicted win, see:
		// https://chessprogramming.wikispaces.com/Pawn+Advantage,+Win+Percentage,+and+ELO
		stats.pWin = 1 / (1 + Math.pow(10, -info.score / 4 / 100));
		stats.score = info.score;

		stats.nps = (stats.totalNodes / stats.totalTime * 1000);
		stats.dNodes = dNodes;
		stats.dTime = dTime;
		stats.relNodes = stats.nps / this.p2Stats.nps;

		$('<div/>').text(addCommasToNumber(stats.totalNodes)).appendTo($stats);
		$('<h5/>').text('Nodes Visited').appendTo($stats);

		$('<div/>').text(addCommasToNumber(stats.totalTime) + ' ms').appendTo($stats);
		$('<h5/>').text('Total Time').appendTo($stats);

		$('<div/>').text(addCommasToNumber(stats.maxDepth)).appendTo($stats);
		$('<h5/>').text('Node Search Depth').appendTo($stats);

		this.$scoreP1Score.text(addCommasToNumber(this.p1Stats.score));
		this.$scoreP2Score.text(addCommasToNumber(this.p2Stats.score));

		this.$scoreP1Advantage.text(roundToDecimals(this.p1Stats.pWin * 100, 1) + '%');
		this.$scoreP2Advantage.text(roundToDecimals(this.p2Stats.pWin * 100, 1) + '%');
	};

	Match.prototype.onPlayerMove = function(move) {
		var result = this.game.move(move);
		if (result.captured) {
			this.onCapturedPiece(result);
		}

		this.board.position(this.game.fen());

		if (this.game.game_over()) {
			this.onGameOver();
		}

		this.startNextTurn();
	};

	Match.prototype.onGameOver = function() {
		console.log('game over');

		// check for various conditions that can cause end of game
		console.log('in checkmate: ' + this.game.in_checkmate());
		console.log('in draw: ' + this.game.in_draw());
		console.log('in threefold_repetition: ' + this.game.in_threefold_repetition());
		console.log('insufficient material: ' + this.game.insufficient_material());
	};

	Match.prototype.onCapturedPiece = function(result) {
		var piece;
		if (this.game.turn() === this.player1.color) {
			piece = 'w';
		} else {
			piece = 'b';
		}

		$('#chess--noneCaptured' + piece).hide();

		switch (result.captured) {
			case this.game.PAWN:
				piece += 'P';
				break;
			case this.game.KNIGHT:
				piece += 'N';
				break;
			case this.game.BISHOP:
				piece += 'B';
				break;
			case this.game.ROOK:
				piece += 'R';
				break;
			case this.game.QUEEN:
				piece += 'Q';
				break;
			case this.game.KING:
				piece += 'K';
				break;
			default:
				console.log('unknown piece capture');
				break;
		}

		$('.chess--holdingPiece' + piece).not('.chess--holdingCaptured').first()
			.addClass('chess--holdingCaptured');
	};

	Match.prototype.startNextTurn = function() {
		// get the moves for the entire game
		var moves = '';
		var history = this.game.history({ verbose: true });
		for (var i = 0; i < history.length; ++i) {
			var move = history[i];
			moves += ' ' + move.from + move.to + (move.promotion ? move.promotion : '');
		}
		var mv = history[history.length - 1];

		if (mv) {
			$('<span/>')
				.addClass('chess--color' + mv.color)
				.html(history.length + '. ' + mv.piece.toUpperCase() + '' + mv.from + ' ' + mv.to).appendTo(this.$gameHistory);
		}

		if (this.game.turn() === this.player1.color) {
			this.resetTurnStats(this.p1Stats);
			this.player1.startTurn(moves, this.moveTime);
		} else {
			this.resetTurnStats(this.p2Stats);
			this.player2.startTurn(moves, this.moveTime);
		}
	};

	app.Match = Match;
}(window.ChessDemo, window.jQuery));