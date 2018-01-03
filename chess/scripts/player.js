(function(app) {
	'use strict';

	/*eslint-disable func-style*/
	function Player(options) {
	/*eslint-enable func-style*/
		this.engine = new Worker(options.stockfishUrl);
		this.engine.onmessage = this.onEngineMessage.bind(this);
		this.engineLoaded = false;
		this.engineReady = false;

		this.skillLevel = options.skillLevel || 0;
		this.color = options.color;
		this.name = options.name || 'Engine';
		this.onReady = options.onReady;
		this.onInfo = options.onInfo;
		this.onMove = options.onMove;

		this.uciCmd('uci');
	}

	Player.prototype.uciCmd = function(cmd) {
		this.engine.postMessage(cmd);
	};

	Player.prototype.startNewGame = function() {
		this.uciCmd('ucinewgame');
		this.uciCmd('isready');
		this.engineReady = false;
	};

	Player.prototype.onEngineMessage = function(event) {
		let line;

		if (event && typeof event === 'object') {
			line = event.data;
		} else {
			line = event;
		}

		if (line === 'uciok') {
			this.engineLoaded = true;
		} else if (line === 'readyok') {
			this.engineReady = true;
			this.setSkillLevel(this.skillLevel);
			if (this.onReady) {
				this.onReady();
			}
		} else {
			let match = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbk])?/);
			if (match) {
				// the AI made a move
				if (this.onMove) {
					this.onMove({
						from: match[1],
						to: match[2],
						promotion: match[3]
					});
				}
			} else {
				// example feedback:
				//info depth 14 seldepth 18 multipv 1 score cp -10 nodes 56851 nps 143563 time 396 pv e8g8 c2c4 c7c5 d4c5 e7c5 a2a3 d5c4 e2c4 b8c6 b2b4 c5e7 b1c3 a7a6 c4b3
				match = line.match(/^info .*\bdepth (\d+) .*\bscore cp (-?\d+) .*\bnodes (\d+) .*\btime (\d+)/);
				if (match) {
					this.onInfo({
						depth: parseInt(match[1], 10) || 0,
						score: parseInt(match[2], 10) || 0,
						nodes: parseInt(match[3], 10) || 0,
						time: parseInt(match[4], 10) || 0
					});
				}
			}
		}
	};

	Player.prototype.startTurn = function(gameMoves, moveTime) {
		this.uciCmd(`position startpos moves${gameMoves || ''}`);
		this.uciCmd(`go movetime ${moveTime || 500}`);
	};

	Player.prototype.setSkillLevel = function(skill) {
		const clampedSkill = Math.max(0, Math.min(skill, 20));
		this.uciCmd(`setoption name Skill Level value ${clampedSkill}`);

		// NOTE: Stockfish level 20 does not make errors (intentially),
		// so these numbers have no effect on level 20.
		// Level 0 starts at 1
		const errorProbability = Math.round((clampedSkill * 6.35) + 1);

		// Level 0 starts at 10
		const maxError = Math.round((clampedSkill * -0.5) + 10);

		this.uciCmd(`setoption name Skill Level Maximum Error value ${maxError}`);
		this.uciCmd(`setoption name Skill Level Probability value ${errorProbability}`);
	};

	Player.prototype.reset = function() {
		this.uciCmd('setoption name Contempt value 0');
		this.setSkillLevel(0);
		this.uciCmd('setoption name King Safety value 0'); /// Agressive 100 (it's now symetric)
	};

	Player.prototype.setContempt = function(contempt) {
		this.uciCmd(`setoption name Contempt value ${contempt}`);
	};

	Player.prototype.setAggressiveness = function(value) {
		this.uciCmd(`setoption name Aggressiveness value ${value}`);
	};

	app.Player = Player;
}(window.ChessDemo));
