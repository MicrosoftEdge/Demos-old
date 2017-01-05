/* global $, audio, db */
(function () {
	'use strict';

	var toArray = function (collection) {
		return [].slice.call(collection);
	};

	var ui = {
		ui: this,

		classes: {
			selected: 'selected',
			highlighted: 'highlighted'
		},

		html: {
			trackRow: '<li class="track" id="track-{NAME}" data-index="{INDEX}">'
			+ '<div class="controls">'
			+ '<a href="#" class="toggler"></a>'
			+ '<div class="label">{TITLE}</div>'
			+ '<input class="volume" type="range" min="0" value="50" max="100" step="5" />'
			+ '</div>'
			+ '<ul class="grid">{GRID}</ul>'
			+ '</li>',

			gridItem: '<li><span></span></li>',

			tableRow: '<tr class="table-row{CLASS}" data-id="{ID}">'
			+ '<td>{NAME}</td>'
			+ '<td>{AUTHOR}</td>'
			+ '<td>{GENRE}</td>'
			+ '<td><a href="#" class="button-delete close">&times;</a></td>'
			+ '</tr>',

			diagOver: '<div id="dialog" role="alertdialog" aria-labelledby="modal-title" aria-describedby="modal-body">'
			+ '<div class="overlay"></div>'
			+ '<div class="dialog" tabindex="-1">'
			+ '<div class="header">'
			+ '<a href="#" class="close">&times;</a>'
			+ '<h4 class="title" id="modal-title"></h4>'
			+ '</div>'
			+ '<div class="body" id="modal-body">'
			+ '<p></p>'
			+ '</div>'
			+ '<div class="footer">'
			+ '<button type="button" class="button-dismiss">Cancel</button>'
			+ '<button type="button" class="button-confirm">OK</button>'
			+ '</div>'
			+ '</div>'
			+ '</div>'
		},

		strings: {
			lose_all_changes: 'Are you sure you want to lose all your unsaved changes?',
			no_same_name: 'Cannot save with the same name.',
			confirm_delete: 'Are you sure you want to delete this?',
			upgrade_browser: 'This browser does not support the WebAudio APIs. Upgrade to Microsoft Edge to experience this application.',
			please_confirm: 'Please confirm',
			provide_following: 'The following must be provided:',
			error_playing: 'Error...',
			about_text: 'About',
			please_note: 'Please note',
			ok: 'OK',
			cancel: 'Cancel',
			paused: 'Paused',
			playing: 'Playing...'
		},

		init: function () {
			$(document).ready(function () {
				audio.init();
				db.init();

				$('#save-form input[type=text]').attr('autocomplete', 'off');

				ui.bindEvents();
			});
		},

		bindEvents: function () {
			$('#button-new').click(function (e) {
				ui.getPermissionForUnsavedChanges(e.target).then(function (confirm) {
					if (confirm) {
						audio.open();
					}
				});
			});

			if (audio.context) {
				$('#play-button').click(function (event) {
					event.preventDefault();

					audio.toggle();
				});

				$('.volume').change(function () {
					var $this = $(this);
					var tracks = audio.savedSet.settings.tracks;
					var volume = parseInt($this.val(), 10);

					if ($this.hasClass('volume-master')) {
						audio.savedSet.settings.volume = volume;

						audio.masterGain.gain.value = audio.savedSet.settings.volume / 100;
					} else {
						var track = $this.parents('.track').data('index');

						tracks[track].volume = volume;
					}

					ui.setUnsavedChanges(true);
				});

				$('.tempo').change(function () {
					var tempo = parseInt($(this).val(), 10);

					audio.savedSet.settings.tempo = tempo;

					ui.setUnsavedChanges(true);
				});
			} else {
				$('#play-text').text(ui.strings.error_playing);
				ui.alert(ui.strings.upgrade_browser);
			}

			$('#dash').on('click', 'a.toggler, .grid li', function (e) {
				e.preventDefault();

				var $this = $(this);
				var tracks = audio.savedSet.settings.tracks;
				var track = $this.parents('.track').data('index');

				// if a toggler was clicked
				if ($this.hasClass('toggler')) {
					$this.toggleClass('off');
					$this.parents('.track').toggleClass('disabled');

					tracks[track].active = !$this.hasClass('off');
					// otherwise a grid item was clicked
				} else {
					$this.toggleClass(ui.classes.selected);

					var note = $this.parent().children().index($this);

					tracks[track].notes[note] = $this.hasClass(ui.classes.selected);
				}

				ui.setUnsavedChanges(true);
			});

			$('#save-form')
				.submit(function (event) {
					event.preventDefault();

					if (!audio.unsavedChanges) {
						return false;
					}

					var metadata = {};
					var emptyFields = [];

					for (var metadataName in audio.defaultSettings.savedSet.metadata) {
						metadata[metadataName] = $('input[name=' + metadataName + ']', this).val();

						if (metadata[metadataName].length === 0) {
							emptyFields.push(metadataName.charAt(0).toUpperCase() + metadataName.substr(1));
						}
					}

					if (emptyFields.length > 0) {
						ui.alert(ui.strings.provide_following
							+ '<br><ul><li>'
							+ emptyFields.join('</li><li>')
							+ '</li></ul>', document.getElementById('button-save'));

						return false;
					}

					audio.savedSet.metadata = metadata;

					db.add(audio.savedSet, audio.currentlyOpenedId).then(function (id) {
						audio.currentlyOpenedId = id;
						ui.setUnsavedChanges(false);
						ui.updateTable();
					}, function (error) {
						if (error === 'ConstraintError') {
							ui.alert(ui.strings.no_same_name);
						}
					});
				})
				.children('input[name=name], input[name=author], input[name=genre]')
				.keyup(function () {
					var $this = $(this);

					if ($this.val() !== audio.savedSet.metadata[$this.attr('name')]) {
						ui.setUnsavedChanges(true);
					}
				})
				.change(function () {
					ui.setUnsavedChanges(true);
				});

			$('#saved-list')
				.on('click', 'tbody tr:not(.active)', function () {
					var $this = $(this);

					ui.getPermissionForUnsavedChanges().then(function (confirm) {
						if (confirm) {
							var id = $this.data('id');

							if (id > -1) {
								db.get(id).then(function (set) {
									audio.open(set, id);
									$this.addClass('active');
								});
							}
						}
					});
				})
				.on('click', '.button-delete', function (e) {
					e.preventDefault();
					e.stopPropagation();
					var $this = $(this);

					ui.confirm(ui.strings.confirm_delete, e.target).then(function (confirm) {
						if (!confirm) {
							return;
						}

						var id = $this.parents('tr').data('id');

						db.remove(id).then(function () {
							if (id === audio.currentlyOpenedId) {
								ui.setUnsavedChanges(true);
								audio.currentlyOpenedId = -1;
							}

							ui.updateTable();
						});
					});
				});

			$('#saved-list-explainer a').click(function (e) {
				e.preventDefault();
				db.populate();
			});
		},

		getPermissionForUnsavedChanges: function (originator) {
			audio.pause();

			return audio.unsavedChanges ?
				ui.confirm(ui.strings.lose_all_changes, originator) :
				Promise.resolve(true);
		},

		drawTracks: function () {
			var tracks = audio.savedSet.settings.tracks;
			var html = '';

			for (var i = 0; i < tracks.length; i++) {
				var trackHTML = this.html.trackRow;

				trackHTML = trackHTML.replace('{INDEX}', i);
				trackHTML = trackHTML.replace('{NAME}', tracks[i].name);
				trackHTML = trackHTML.replace('{TITLE}', tracks[i].name.charAt(0).toUpperCase()
					+ tracks[i].name.substr(1).toLowerCase());

				var gridHTML = '';
				for (var j = 0; j < audio.notes; j++) {
					gridHTML += this.html.gridItem;
				}

				trackHTML = trackHTML.replace('{GRID}', gridHTML);

				html += trackHTML;
			}

			$('#dash').html(html);
		},

		playPause: function (play) {
			if (!play) {
				$('#play-button .icon-play').show();
				$('#play-button .icon-pause').hide();
				$('#play-text').text(this.strings.paused);
			} else {
				$('#play-button .icon-play').hide();
				$('#play-button .icon-pause').show();
				$('#play-text').text(this.strings.playing);
			}
		},

		clearPlayhead: function (currentIndex) {
			$('.grid li:nth-child(' + (currentIndex + 1) + ')').removeClass(this.classes.highlighted);
		},

		clearActiveRow: function () {
			$('#saved-list tr.active').removeClass('active');
		},

		updateTable: function () {
			return db.getConfigs().then(function (items) {
				var html = '';

				if (items.length === 0) {
					$('#saved-list').hide();
					$('#saved-list-explainer').show();
				} else {
					for (var i = 0; i < items.length; i++) {
						var trHTML = ui.html.tableRow;
						trHTML = trHTML.replace('{CLASS}', items[i].id === audio.currentlyOpenedId ? ' active' : '');
						trHTML = trHTML.replace('{ID}', items[i].id);
						trHTML = trHTML.replace('{NAME}', items[i].metadata.name);
						trHTML = trHTML.replace('{AUTHOR}', items[i].metadata.author);
						trHTML = trHTML.replace('{GENRE}', items[i].metadata.genre);

						html += trHTML;
					}

					$('#saved-list').show();
					$('#saved-list-explainer').hide();
				}

				$('tbody').html(html);
			});
		},

		updateTracks: function (savedSet) {
			var tracks = savedSet.settings.tracks;

			$('.volume-master').val(savedSet.settings.volume);
			$('.tempo').val(savedSet.settings.tempo);

			$('#save-form input[name=name]').val(savedSet.metadata.name);
			$('#save-form input[name=author]').val(savedSet.metadata.author);
			$('#save-form input[name=genre]').val(savedSet.metadata.genre);

			for (var i = 0; i < tracks.length; i++) {
				var track = $('.track:nth(' + i + ')');

				track.toggleClass('disabled', !tracks[i].active);
				$('.toggler', track).toggleClass('off', !tracks[i].active);

				$('.volume', track).val(tracks[i].volume);

				for (var j = 0; j < audio.notes; j++) {
					$('.grid li:nth(' + j + ')', track).toggleClass(this.classes.selected, tracks[i].notes[j]);
				}
			}
		},

		movePlayheadForward: function (currentIndex, previousIndex) {
			$('.grid li:nth-child(' + (currentIndex + 1) + ')').addClass(this.classes.highlighted);
			$('.grid li:nth-child(' + (previousIndex + 1) + ')').removeClass(this.classes.highlighted);
		},

		setUnsavedChanges: function (unsavedChanges) {
			audio.unsavedChanges = unsavedChanges;

			$('#save-form button[type=submit]').toggleClass('disabled', !audio.unsavedChanges);
		},

		alert: function (str, originator) {
			var diag = ui.createAndShowDiag(ui.strings.please_note, str, originator);

			$('.button-dismiss', diag).text(ui.strings.ok);
			$('.button-confirm', diag).hide();

			return diag;
		},

		confirm: function (str, originator) {
			var diag = ui.createAndShowDiag(ui.strings.please_confirm, str, originator);

			$('.button-dismiss', diag).text(ui.strings.cancel);
			$('.button-confirm', diag).show();

			return new Promise(function (resolve) {
				$('.button-confirm', diag).on('click.confirm', function () {
					resolve(true);
					ui.dialog.hide();
				});

				diag.on('hidden.dialog', function () {
					resolve(false);

					// cleanup while we're at it
					$(this).off('hidden.dialog');
					$('.button-confirm', this).off('click.confirm');
				});
			});
		},

		createAndShowDiag: function (title, msg, originator) {
			var diag = ui.dialog.init();

			ui.dialog.setTitle(title);
			ui.dialog.setText(msg);

			ui.dialog.originator = originator;
			ui.dialog.show();

			return diag;
		},

		dialog: {
			el: null,
			active: false,
			overlay: null,
			dialog: null,
			focusableArray: [],
			focusIndex: 0,
			originator: null,

			init: function () {
				if (!this.el) {
					this.el = $(ui.html.diagOver).appendTo('#audiomixer');
					this.overlay = $('.overlay', this.el);
					this.dialog = $('.dialog', this.el);
					this.overlay.add('.button-dismiss, .close', this.el)
						.on('click.dismiss', function (e) {
							e.preventDefault();
							ui.dialog.hide();
						});

					var tabFocus = function (e) {
						e.preventDefault();
						if (ui.dialog.focusableArray.length === 1) {
							ui.dialog.focusableArray[0].focus();
						} else if (ui.dialog.focusableArray.length > 1) {
							if (e.shiftKey) {
								ui.dialog.focusIndex--;
							} else {
								ui.dialog.focusIndex++;
							}

							if (ui.dialog.focusIndex < 0) {
								ui.dialog.focusIndex = ui.dialog.focusableArray.length - 1;
							} else if (ui.dialog.focusIndex > ui.dialog.focusableArray.length - 1) {
								ui.dialog.focusIndex = 0;
							}

							var itemToFocus = ui.dialog.focusableArray[ui.dialog.focusIndex];
							if (itemToFocus.style.display !== 'none') {
								itemToFocus.focus();
							} else {
								tabFocus(e);
							}
						}
					};

					$(document).on('keydown', function (e) {
						if (ui.dialog.active) {
							if (e.keyCode === 27) {
								ui.dialog.hide();
							} else if (e.keyCode === 9) {
								tabFocus(e);
							}
						}
					});
				}

				this.focusableArray = toArray($('a, input, button, [tabindex]:not([tabindex="-1"])', this.el));
				return this.el;
			},

			setTitle: function (title) {
				$('.title', this.el).text(title);
			},

			setText: function (text) {
				$('.body p', this.el).html(text);
			},

			show: function () {
				if (!this.active) {
					this.active = true;
					this.el.scrollTop(0).fadeIn(100);
					this.focusIndex = this.focusableArray.indexOf(this.dialog);
					this.dialog.focus();
				}
			},

			hide: function () {
				if (this.active) {
					this.active = false;
					this.el.fadeOut(100).trigger('hidden.dialog');
					if (this.originator) {
						this.originator.focus();
					}
				}
			}
		}
	};

	window.ui = ui;

	ui.init();
}());
