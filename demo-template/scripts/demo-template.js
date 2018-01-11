/*
 *	DEMO TEMPLATE SCRIPTS
 *	=============================================
 */

/*
 *	COMPONENT: DEMO NAV
 *	---------------------------------------------
 */

/* Generates nav items for each section on the page */
(function () {
	'use strict';

	const demoNavItems = document.getElementById('js-nav-items');
	const pageSections = document.querySelectorAll('[data-nav-label]');

	for (let i = 0; i < pageSections.length; i++) {
		const section = pageSections[i];
		const newLink = document.createElement('li');
		newLink.className = 'c-demo-nav__item';
		newLink.innerHTML = `<a href="#${section.getAttribute('id')}"><span class="c-demo-nav__item-flag">${section.getAttribute('data-nav-label')}</span></a>`;
		demoNavItems.appendChild(newLink);
	}
}());

//nav menu
(function () {
	'use strict';

	const menu = document.querySelector('.c-demo-nav__btn');
	const items = menu.parentElement.querySelector('.c-demo-nav__items');

	const collapse = function () {
		items.setAttribute('aria-hidden', 'true');
		menu.setAttribute('aria-expanded', 'false');
	};


	const toggleSection = function (evt) {
		evt.preventDefault();
		evt.stopPropagation();
		const expanded = evt.currentTarget.getAttribute('aria-expanded') === 'true';

		// const expandedParent = isParentExpanded(evt.currentTarget.parentElement);

		if (expanded) {
			collapse();
		} else {
			items.removeAttribute('aria-hidden');
			menu.setAttribute('aria-expanded', 'true');
		}
	};

	const toggleKeydownSection = function (evt) {
		const key = evt.which || evt.keyCode;

		if (key !== 32 && key !== 13) {
			return;
		}

		toggleSection(evt);
	};


	menu.addEventListener('click', toggleSection, false);
	menu.addEventListener('keydown', toggleKeydownSection, false);

	document.addEventListener('click', function () {
		collapse();
	});

	const insideContainer = function (item, container) {
		let result = false;

		while (item) {
			if (item === container) {
				result = true;
				break;
			}

			item = item.parentElement; //eslint-disable-line no-param-reassign
		}

		return result;
	};

	document.addEventListener('focus', function (evt) {
		const target = evt.target;
		const expandedMenus = document.querySelectorAll('.navbar__submenu:not([aria-hidden="true"])');

		if (expandedMenus.length === 0) {
			return;
		}

		for (let j = 0, lj = expandedMenus.length; j < lj; j++) {
			const expandedMenu = expandedMenus[j];

			if (!insideContainer(target, expandedMenu)) {
				expandedMenu.setAttribute('aria-hidden', 'true');
				expandedMenu.parentElement.querySelector('[aria-expanded="true"]').removeAttribute('aria-expanded');
			}
		}
	}, true);
}());

/* eslint-env browser */
/* eslint-disable no-var, prefer-template, strict, prefer-arrow-callback, object-shorthand, no-continue */
/*globals event*/
(function () {
	'use strict';

	var menus = document.querySelectorAll('[data-menu]');

	if (menus.length === 0) {
		return;
	}

	var findIndex = function (element, elements) {
		var index, l;

		for (index = 0, l = elements.length; index < l; index++) {
			if (elements[index] === element) {
				return index;
			}
		}

		return null;
	};

	var next = function (elements) {
		return function (index) {
			if (typeof index === 'number') {
				var i = index + 1;
				var element = elements[i];
				var current = document.activeElement;

				while (element) {
					element.focus();
					if (current !== document.activeElement) {
						break;
					} else {
						i++;
						element = elements[i];
					}
				}
			}
		};
	};

	var previous = function (elements) {
		return function (index) {
			if (typeof index === 'number') {
				var i = index - 1;
				var element = elements[i];
				var current = document.activeElement;

				while (element) {
					element.focus();
					if (current !== document.activeElement) {
						break;
					} else {
						i--;
						element = elements[i];
					}
				}
			}
		};
	};

	var findSiblings = function (source, type, topParent) {
		if (source === topParent) {
			return [];
		}

		var parent = source.parentElement;

		//var elements = parent.querySelectorAll(':scope > ' + type);
		var elements = topParent.querySelectorAll(type);

		if (elements.length === 1) {
			return findSiblings(parent, type, topParent);
		}

		return elements;
	};

	var arrowAction = function (action, container) {
		var activeElement = document.activeElement;
		//var elements = container.querySelectorAll(activeElement.tagName.toLowerCase());
		var elements = findSiblings(activeElement, activeElement.tagName.toLowerCase(), container);
		var nextElementTo = action(elements);

		nextElementTo(findIndex(activeElement, elements));
	};

	var keydown = function (container) {
		return function () {
			var key = event.keyCode;
			var handled = true;

			//right or down
			if (key === 39 || key === 40) {
				arrowAction(next, container);
				//up or left
			} else if (key === 38 || key === 37) {
				arrowAction(previous, container);
			} else {
				handled = false;
			}

			if (handled) {
				event.stopPropagation();
				event.preventDefault();
			}
		};
	};

	for (var i = 0, l = menus.length; i < l; i++) {
		var menu = menus[i];

		menu.addEventListener('keydown', keydown(menu), false);
	}
}());
