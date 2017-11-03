/*globals $*/
var ReadingView = ReadingView || {};
//$(document).ready(function () {
(function () {
	'use strict';
	//cache dom locators
	var $infoH = $('#info-h');
	var $infoTitle = $('.info-title');
	var $infoCodeSnippet = $('.info-code-snippet');
	var $infoExplanation = $('.info-explanation');
	var $infoRV = $('#info-rv');
	var clickID = '';
	var clickedWebEleID = '';
	var clickedRVEleID = '';
	var clickedCodeNavID = '';
	var clickedRVNavID = '';
	var $rv,
		$wv,
		$cv;

	var generateCodeView = function () {
		//walk thru all elements infoBoxContent
		var infoBoxContent = ReadingView.data.infoBoxContent;
		for (var eleKey in infoBoxContent) {
			if (infoBoxContent.hasOwnProperty(eleKey)) {
				var infoBoxContentElement = infoBoxContent[eleKey];
				var eleID = 'Code' + infoBoxContentElement.eleName;
				var divHTML = '<div id = "' + eleID + '" class = "article-element"' + '>';
				var titleHTML = '<h2 class ="code-title">' + infoBoxContentElement.title + '</h2><br/>';
				var explanationHTML = '<div class="CodeExplanation">' + infoBoxContentElement.explanation + '</div>';
				var endDivHTML = '</div>';
				var codeHTML,
					finalHTML;

				if (infoBoxContentElement.rawCode.length > 0) {
					codeHTML = '<div class ="code-snippet"><pre class="brush:js">' + infoBoxContentElement.rawCode + '</pre></div>';
					explanationHTML += '<br/>';
					finalHTML = divHTML + titleHTML + explanationHTML + codeHTML + endDivHTML;
				} else {
					explanationHTML = '<div class="CodeExplanation">' + infoBoxContentElement.explanation + '</div>';
					finalHTML = divHTML + titleHTML + explanationHTML + endDivHTML;
				}

				$('#code-view').append(finalHTML);
			}
		}
	};

	// -------------------------- HELPER FUNCTIONS ------------------------------------------//
	var startView = function () {
		//select the Web button
		$('#webNav').trigger('click');
		clickID = 'web-nav';

		$rv = $('#reading-view');
		$wv = $('#web-view');
		$cv = $('#code-view');
	};

	var updateInfoContent = function (eleID) {
		//update info box content
		$infoTitle.text(ReadingView.data.infoBoxContent[eleID].title);

		//if there is no code content, hide the border
		if (ReadingView.data.infoBoxContent[eleID].code.length === 0) {
			$infoCodeSnippet.css('border-width', '0');
			$infoCodeSnippet.html('');
		} else {
			$infoCodeSnippet.css('border', '1px solid black');
			$infoCodeSnippet.html(ReadingView.data.infoBoxContent[eleID].code);
		}

		$infoExplanation.html(ReadingView.data.infoBoxContent[eleID].explanation);
	};

	// -------------------------- LEFT NAVBAR ------------------------------------------//
	//ids of all elements we will be marking
	var initLeftNavBar = function () {
		var ids = ReadingView.data.navBarElementsIDs;

		var onHoverInNavBarEle = function (e) {
			if ($cv.is(':visible')) {
				if (clickedCodeNavID !== e.target.id) {
					ReadingView.utils.highlightNav($(this));
				}
			}
			if ($rv.is(':visible')) {
				if (clickedRVNavID !== e.target.id) {
					ReadingView.utils.highlightNav($(this));
				}
			}
			if ($wv.is(':visible')) {
				if (ReadingView.data.clickedNavID !== e.target.id) {
					ReadingView.utils.highlightNav($(this));
				}
			}
		};

		var onHoverOutNavBarEle = function (e) {
			var $this = $(this);
			if ($cv.is(':visible')) {
				if (clickedCodeNavID !== e.target.id) {
					ReadingView.utils.unhighlightNav($this);
				}
			}
			if ($rv.is(':visible')) {
				if (clickedRVNavID !== e.target.id) {
					ReadingView.utils.unhighlightNav($this);
				}
			}
			if ($wv.is(':visible')) {
				if (ReadingView.data.clickedNavID !== e.target.id) {
					ReadingView.utils.unhighlightNav($this);
				}
			}
		};

		var onClickNavBarEle = function () {
			var scrollValue;
			ReadingView.utils.highlightClickNav(this);

			//update info box content
			var eleName = this.id.substr(3, this.id.length - 1);

			if ($cv.is(':visible')) {
				var codeViewCurrentID = 'Code' + eleName;
				var codeViewElement = document.getElementById(codeViewCurrentID);

				if (clickedCodeNavID !== codeViewCurrentID) {
					ReadingView.utils.unhighlightNav($('#' + clickedCodeNavID));
				}

				clickedCodeNavID = this.id;

				scrollValue = codeViewElement.offsetTop - 25;
				$('#code-view').animate({
					scrollTop: scrollValue
				}, 400);
			}

			if ($rv.is(':visible')) {
				var readingViewCurrentID = 'td' + eleName;
				var readingViewElement = document.getElementById(readingViewCurrentID);
				ReadingView.utils.highlight(readingViewElement);

				if (clickedRVEleID.length > 0 && clickedRVEleID !== readingViewCurrentID) {
					ReadingView.utils.unhighlight(document.getElementById(clickedRVEleID));
					if (clickedRVNavID !== this.id) {
						ReadingView.utils.unhighlightNav($('#' + clickedRVNavID));
					}
				}

				//set pop up
				var webID = 'web' + eleName;
				updateInfoContent(webID);

				//set the position of the infoBox and make it appear
				ReadingView.utils.setInfo(readingViewElement);

				//save RV clicked id
				clickedRVEleID = readingViewElement.id;
				clickedRVNavID = this.id;

				if (eleName === 'FigCaption' || eleName === 'InlineImage') {
					//animate to the right
					$('#reading-view').animate({
						scrollLeft: 1850
					}, 400);
				} else if (eleName === 'Copyright') {
					$('#reading-view').animate({
						scrollLeft: 2300
					}, 400);
				} else {
					$('#reading-view').animate({
						scrollLeft: 0
					}, 400);
				}
			}

			if ($wv.is(':visible')) {

				var webViewCurrentID = 'web' + eleName;
				var webViewElement = document.getElementById(webViewCurrentID);

				ReadingView.utils.highlightH(webViewElement);

				if (clickedWebEleID.length > 0 && clickedWebEleID !== webViewCurrentID) {
					ReadingView.utils.unhighlightH(document.getElementById(clickedWebEleID));
					if (ReadingView.data.clickedNavID !== this.id) {
						ReadingView.utils.unhighlightNav($('#' + ReadingView.data.clickedNavID));
					}
				}

				//update info box content
				updateInfoContent(webViewCurrentID);

				//set the position of the infoBox and make it appear
				ReadingView.utils.setInfoH(webViewElement);

				//save RV clicked id
				clickedWebEleID = webViewCurrentID;
				ReadingView.data.clickedNavID = this.id;

				scrollValue = webViewElement.offsetTop - 25;
				$('#web-view').animate({
					scrollTop: scrollValue
				}, 400);
			}
		};

		for (var i = 0, li = ids.length; i < li; i++) {
			var id = ids[i];
			var jQueryNavID = '#' + id;
			var $currEle = $(jQueryNavID);
			$currEle.hover(onHoverInNavBarEle, onHoverOutNavBarEle);

			var ele = document.getElementById(id);
			ele.addEventListener('click', onClickNavBarEle);
		}
	};

	// -------------------------- READINGVIEW EVENT HANDLERS  ------------------------------------------//
	//bind click and hover handlers for all clickable region divs
	var initReadinViewEventHandlers = function () {
		var ids = ReadingView.data.readingViewElementsIDs;

		var onClickReadingViewElement = function () {
			var eleName = (this.id).substr(2, this.id.length - 1);
			//update info box content
			var readingViewtoWebID = 'web' + eleName;

			updateInfoContent(readingViewtoWebID);

			ReadingView.utils.highlight(this);

			//set the position of the infoBox and make it appear
			ReadingView.utils.setInfo(this);

			//save RV clicked id
			clickedRVEleID = this.id;

			var tempNavID = 'nav' + eleName;
			ReadingView.utils.highlightClickNav(document.getElementById(tempNavID));

			if (tempNavID !== clickedRVNavID) {
				ReadingView.utils.unhighlightNav($('#' + clickedRVNavID));
			}

			clickedRVNavID = tempNavID;
		};

		var onMouseOverReadingViewElement = function () {
			ReadingView.utils.highlight(this);

			//if you over a nonClickedID element, then hide the infobox
			if (this.id !== clickedRVEleID) {
				ReadingView.utils.hideInfo($infoRV);
				if (clickedRVEleID.length > 0) {
					ReadingView.utils.unhighlight(document.getElementById(clickedRVEleID));
				}
			}
		};

		var onMouseOutReadingViewElement = function () {
			//if the event has not been clicked on, remove the highlight
			if ($infoRV.css('opacity') === '0') {
				ReadingView.utils.unhighlight(this);
			}
		};

		for (var i = 0, li = ids.length; i < li; i++) {
			var readingViewElement = document.getElementById(ids[i]);
			readingViewElement.addEventListener('click', onClickReadingViewElement);
			readingViewElement.addEventListener('mouseover', onMouseOverReadingViewElement);
			readingViewElement.addEventListener('mouseout', onMouseOutReadingViewElement);
		}
	};

	// -------------------------- TOP NAVBAR ------------------------------------------//
	var initTopNavBar = function () {
		var $codeNav = $('#code-nav');
		var $webNav = $('#web-nav');
		var $readingNav = $('#reading-nav');

		var clearPane = function (paneName) {
			//reset all IDs and hide all highlights and regions
			//if the reading view is visible, hide the WV click region and and WV info box
			if (paneName === 'web-view') {
				if (ReadingView.data.clickedNavID.length > 0) {
					ReadingView.utils.unhighlightH(clickedWebEleID);
					ReadingView.utils.hideInfo($infoH);
					clickedWebEleID = '';
				}
			}
			//if we are switching out of the web pane, clearn the web pane
			if (paneName === 'reading-view') {
				if (clickedRVEleID.length > 0) {
					ReadingView.utils.unhighlight(document.getElementById(clickedRVEleID));
					ReadingView.utils.hideInfo($infoRV);
					clickedRVEleID = '';
				}
			}
		};

		$webNav.click(function (event) {
			if (clickID !== 'web-nav') {
				ReadingView.utils.clearLeftNav();
			}
			clearPane('reading-view');
			$rv.hide();
			$wv.show();
			$cv.hide();
			$codeNav.css('background-image', 'url("images/code_rest.gif")');
			$readingNav.css('background-image', 'url("images/reading_rest.gif")');
			$webNav.css('background-image', 'url("images/web_selected.gif")');
			clickID = event.target.id;
		});

		$codeNav.click(function (event) {
			if (clickID !== 'code-nav') {
				ReadingView.utils.clearLeftNav();
			}
			$rv.hide();
			$wv.hide();
			$cv.show();
			$codeNav.css('background-image', 'url("images/code_selected.gif")');
			$readingNav.css('background-image', 'url("images/reading_rest.gif")');
			$webNav.css('background-image', 'url("images/web_rest.gif")');
			clickID = event.target.id;
		});

		$readingNav.click(function (event) {
			if (clickID !== 'reading-nav') {
				ReadingView.utils.clearLeftNav();
			}
			$rv.show();
			$wv.hide();
			$cv.hide();
			$codeNav.css('background-image', 'url("images/code_rest.gif")');
			$readingNav.css('background-image', 'url("images/reading_selected.gif")');
			$webNav.css('background-image', 'url("images/web_rest.gif")');
			clickID = event.target.id;
		});

		$webNav.hover(function () {
			if (clickID !== 'web-nav') {
				$webNav.css('background-image', 'url("images/web_hover.gif")');
			}
		}, function () {
			if (clickID !== 'web-nav') {
				$webNav.css('background-image', 'url("images/web_rest.gif")');
			}
		});

		$codeNav.hover(function () {
			if (clickID !== 'code-nav') {
				$codeNav.css('background-image', 'url("images/Code_hover.gif")');
			}
		}, function () {
			if (clickID !== 'code-nav') {
				$codeNav.css('background-image', 'url("images/Code_rest.gif")');
			}
		});

		$readingNav.hover(function () {
			if (clickID !== 'reading-nav') {
				$readingNav.css('background-image', 'url("images/reading_hover.gif")');
			}
		}, function () {
			if (clickID !== 'reading-nav') {
				$readingNav.css('background-image', 'url("images/reading_rest.gif")');
			}
		});
	};

	// -------------------------- WEBVIEW EVENT HANDLERS  ------------------------------------------//
	var initWebViewEventHandlers = function () {
		//for all web RV ele IDs bind click and hover handlers
		var ids = ReadingView.data.webReadingViewElementsIDs;

		var onClickWebViewElement = function () {
			var eleName = this.id.substr(3, this.id.length - 1);
			var currNavID = 'nav' + eleName;
			ReadingView.utils.highlightH(this);
			//update info box content
			updateInfoContent(this.id);
			//set the position of the infoBox and make it appear
			ReadingView.utils.setInfoH(this);
			//save RV clicked id
			clickedWebEleID = this.id;
			//update the left side menu for clicks
			ReadingView.utils.highlightClickNav(document.getElementById(currNavID));
			if (currNavID !== ReadingView.data.clickedNavID) {
				ReadingView.utils.unhighlightNav($('#' + ReadingView.data.clickedNavID));
			}
			ReadingView.data.clickedNavID = currNavID;
		};

		var onMouseOverWebViewElement = function () {
			ReadingView.utils.highlightH(this);
			//if you hover a nonClickedID element, then hide the infobox
			if (this.id !== clickedWebEleID) {
				if (clickedWebEleID.length > 0) {
					ReadingView.utils.unhighlightH(document.getElementById(clickedWebEleID));
				}
				ReadingView.utils.hideInfo($infoH);
				//unhiglight the navbar
				ReadingView.utils.unhighlightNav($('#' + ReadingView.data.clickedNavID));
				ReadingView.data.clickedNavID = '';
			}
		};

		var onMouseOutWebViewElement = function () {
			if ($infoH.css('opacity') === '0') {
				ReadingView.utils.unhighlightH(this);
			}
		};

		for (var i = 0, li = ids.length; i < li; i++) {
			var webViewElement = document.getElementById(ids[i]);
			webViewElement.addEventListener('click', onClickWebViewElement);
			webViewElement.addEventListener('mouseover', onMouseOverWebViewElement);
			webViewElement.addEventListener('mouseout', onMouseOutWebViewElement);
		}

		var $webView = $('#web-view');
		$webView.click(function (event) {
			if (event.target.id !== clickedWebEleID && event.target.id !== 'info-h' && !$(event.target).hasClass('info-child')) {
				//hide the info box
				ReadingView.utils.hideInfo($infoH);
				//remove the highlight
				if (clickedWebEleID.length > 0) {
					ReadingView.utils.unhighlightH(document.getElementById(clickedWebEleID));
					var navName = 'nav' + clickedWebEleID.substr(3, clickedWebEleID.length - 1);
					ReadingView.utils.unhighlightNav($('#' + navName));
				}
			}
		});

		var $readingViewView = $('#reading-view');
		$readingViewView.click(function (event) {
			if (event.target.id !== clickedRVEleID && event.target.id !== 'info' && !$(event.target).hasClass('info-child')) {
				//hide the info box
				ReadingView.utils.hideInfo($('#info-rv'));
				//remove the highlight
				if (clickedRVEleID.length > 0) {
					ReadingView.utils.unhighlight(document.getElementById(clickedRVEleID));
					var navName = 'nav' + clickedRVEleID.substr(2, clickedRVEleID.length - 1);
					ReadingView.utils.unhighlightNav($('#' + navName));
				}
			}
		});
	};

	var initSyntaxHighlighter = function () {
		SyntaxHighlighter.defaults['html-script'] = true;
		SyntaxHighlighter.defaults['gutter'] = false;
		SyntaxHighlighter.defaults['toolbar'] = false;
		SyntaxHighlighter.all();
	};

	generateCodeView();
	startView();
	initLeftNavBar();
	initReadinViewEventHandlers();
	initTopNavBar();
	initWebViewEventHandlers();
	initSyntaxHighlighter();
}());
