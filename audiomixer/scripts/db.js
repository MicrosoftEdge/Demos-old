/* global $, ui, audio */
(function() {
	'use strict';

	var db = {
		_db: null,
		configsStoreName: 'configs',
		dbName: 'WebAudioDemo',
		presets: [
			{
				name: 'Microsoft Edge',
				author: 'Microsoft Edge',
				genre: 'Awesomeness',
				volume: 50,
				tempo: 135,
				notes: [
					[true, true, true, false, true, true, false, false, false, true, true, false, false, true, true, true],
					[true, false, false, false, true, false, true, false, true, false, false, true, false, true, false, false],
					[true, false, false, false, true, false, true, false, true, false, false, false, false, true, false, false],
					[true, true, true, false, true, false, true, false, true, false, true, true, false, true, true, true],
					[true, false, false, false, true, false, true, false, true, false, false, true, false, true, false, false],
					[true, false, false, false, true, false, true, false, true, false, false, true, false, true, false, false],
					[true, true, true, false, true, true, false, false, false, true, true, false, false, true, true, true]
				]
			},
			{
				name: 'Microsoft Edge (Inverted)',
				author: 'Microsoft Edge',
				genre: 'Awesomeness',
				volume: 50,
				tempo: 165,
				notes: [
					[false, false, false, true, false, false, true, true, true, false, false, true, true, false, false, false],
					[false, true, true, true, false, true, false, true, false, true, true, false, true, false, true, true],
					[false, true, true, true, false, true, false, true, false, true, true, true, true, false, true, true],
					[false, false, false, true, false, true, false, true, false, true, false, false, true, false, false, false],
					[false, true, true, true, false, true, false, true, false, true, true, false, true, false, true, true],
					[false, true, true, true, false, true, false, true, false, true, true, false, true, false, true, true],
					[false, false, false, true, false, false, true, true, true, false, false, true, true, false, false, false]
				]
			},
			{
				name: 'Microsoft (MS)',
				author: 'Microsoft',
				genre: 'Awesomeness',
				volume: 50,
				tempo: 165,
				notes: [
					[false, true, false, false, false, false, false, true, false, true, true, true, true, true, true, false],
					[false, true, true, false, false, false, true, true, false, true, false, false, false, false, false, false],
					[false, true, false, true, false, true, false, true, false, true, false, false, false, false, false, false],
					[false, true, false, false, true, false, false, true, false, true, true, true, true, true, true, false],
					[false, true, false, false, false, false, false, true, false, false, false, false, false, false, true, false],
					[false, true, false, false, false, false, false, true, false, false, false, false, false, false, true, false],
					[false, true, false, false, false, false, false, true, false, true, true, true, true, true, true, false]
				]
			},
			{
				name: 'Microsoft (Inverted)',
				author: 'Microsoft',
				genre: 'Awesomeness',
				volume: 50,
				tempo: 165,
				notes: [
					[true, false, true, true, true, true, true, false, true, false, false, false, false, false, false, true],
					[true, false, false, true, true, true, false, false, true, false, true, true, true, true, true, true],
					[true, false, true, false, true, false, true, false, true, false, true, true, true, true, true, true],
					[true, false, true, true, false, true, true, false, true, false, false, false, false, false, false, true],
					[true, false, true, true, true, true, true, false, true, true, true, true, true, true, false, true],
					[true, false, true, true, true, true, true, false, true, true, true, true, true, true, false, true],
					[true, false, true, true, true, true, true, false, true, false, false, false, false, false, false, true]
				]
			}
		],

		init: function() {
			var dbRequest = indexedDB.open(this.dbName);

			dbRequest.onupgradeneeded = function() {
				db._db = dbRequest.result;

				var configsStore = db._db.createObjectStore(db.configsStoreName, {autoIncrement: true});
				configsStore.createIndex('name', 'metadata.name', {unique: true});
				configsStore.createIndex('author', 'metadata.author', {unique: false});
				configsStore.createIndex('genre', 'metadata.genre', {unique: false});
			};

			dbRequest.onsuccess = function() {
				db._db = dbRequest.result;

				ui.updateTable();
			};
		},

		populate: function() {
			var sets = [];

			for (var i = 0; i < db.presets.length; i++) {
				var set = db.presets[i];
				var baseSet = $.extend(true, {}, audio.defaultSettings.savedSet);

				baseSet.metadata.name = set.name || baseSet.metadata.name;
				baseSet.metadata.author = set.author || baseSet.metadata.author;
				baseSet.metadata.genre = set.genre || baseSet.metadata.genre;
				baseSet.settings.volume = set.volume || baseSet.settings.volume;
				baseSet.settings.tempo = set.tempo || baseSet.settings.tempo;

				for (var j = 0; j < set.notes.length; j++) {
					baseSet.settings.tracks[j].notes = set.notes[j] || baseSet.settings.tracks[j].notes;
				}

				sets.push(baseSet);
			}

			db.add(sets).then(function() {
				ui.updateTable();
			});
		},

		getConfigs: function() {
			return new Promise(function(resolve, reject) {
				var tx = db._db.transaction([db.configsStoreName], 'readonly');
				var os = tx.objectStore(db.configsStoreName);

				var cursorRequest = os.openCursor();

				var arr = [];

				cursorRequest.onsuccess = function() {
					var cursor = cursorRequest.result;

					if (cursor) {
						cursor.value.id = cursor.primaryKey;
						arr.push(cursor.value);

						cursor.continue();
					} else {
						resolve(arr);
					}
				};

				cursorRequest.onerror = function() {
					reject();
				};
			});
		},

		add: function(obj, id) {
			return new Promise(function(resolve, reject) {
				var tx = db._db.transaction([db.configsStoreName], 'readwrite');
				var os = tx.objectStore(db.configsStoreName);

				if (obj.constructor !== Array) {
					var request;

					if (id > -1) {
						request = os.put(obj, id);
					} else {
						request = os.add(obj);
					}

					request.onsuccess = function(event) {
						resolve(event.target.result);
					};

					request.onerror = function(event) {
						reject(event.target.error.name);
					};
				} else {
					for (var i = 0; i < obj.length; i++) {
						os.add(obj[i]);
					}

					tx.oncomplete = function(event) {
						resolve(event.target.result);
					};

					tx.onabort = function(event) {
						reject(event.target.error.name);
					};
				}
			});
		},

		remove: function(id) {
			return new Promise(function(resolve, reject) {
				var tx = db._db.transaction([db.configsStoreName], 'readwrite');

				var request = tx.objectStore(db.configsStoreName).delete(id);

				request.onsuccess = function(event) {
					resolve(event.target.result);
				};

				request.onerror = function(event) {
					reject(event.target.error.name);
				};
			});
		},

		get: function(id) {
			return new Promise(function(resolve, reject) {
				var tx = db._db.transaction([db.configsStoreName], 'readonly');

				var request = tx.objectStore(db.configsStoreName).get(id);

				request.onsuccess = function(event) {
					resolve(event.target.result);
				};

				request.onerror = function(event) {
					reject(event.target.error.name);
				};
			});
		}
	};

	window.db = db;
}());
