/*
 *	GUIDE TEMPLATE SCRIPTS
 *	=============================================
 */

/*
 *	COMPONENT: GUIDE NAV
 *	---------------------------------------------
 */

/* Generates nav items for each section on the page */
var populateGuideNav = function() {
    var guideNavItems = document.getElementById('js-nav-items');
    var pageSections = document.querySelectorAll('[data-nav-label]');

    for (var i = 0; i < pageSections.length; i++) {
        var section = pageSections[i];
        var newLink = document.createElement('li');
        newLink.className = 'c-guide-nav__item';
        newLink.innerHTML = '<a href="#' + section.getAttribute('id') + '"><span class="c-guide-nav__item-flag">' + section.getAttribute('data-nav-label') + '</span></a>';
        guideNavItems.appendChild(newLink);
    }
};

populateGuideNav();