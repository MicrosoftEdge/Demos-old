(function () {

    function configureUI() {
        if (window.MSApp)
        {
            return;
        }

        var returnElement;
        var containerElement;
        var shareFacebookElement;
        var shareTwitterElement;
        var shareEmailElement;

        var shareFacebookUrl = 'https://www.facebook.com/sharer.php?u=' + location.href + '&t=' + document.title;
        var shareTwitterUrl = 'http://twitter.com/share';
		if(document.title == '') {
			var shareEmailURL = 'mailto:?subject=Internet Explorer 10 Test Drive Demo&body=Check out this demo on the Internet Explorer Test Drive website. %0A %0A' + location.href + '%0A%0A';
		} else {
		    var shareEmailURL = 'mailto:?subject=' + document.title + '&body=Check out the ' + document.title + ' on the Internet Explorer Test Drive website. %0A %0A' + location.href + '%0A%0A';
		}
        containerElement = document.getElementById('ReturnAndShareControls');

        returnElement = document.createElement('a');
        returnElement.removeAttribute('id');
        returnElement.setAttribute('class', 'ReturnButton');
		returnElement.setAttribute('className', 'ReturnButton');
        returnElement.setAttribute('href', '../../Default.html');
        returnElement.setAttribute('alt', 'Return to Test Drive Home');
        returnElement.setAttribute('title', 'Return to Test Drive Home');

        shareFacebookElement = document.createElement('a');
        shareFacebookElement.setAttribute('class', 'ShareOnFacebookButton');
		shareFacebookElement.setAttribute('className', 'ShareOnFacebookButton');
        shareFacebookElement.setAttribute('href', shareFacebookUrl);
        shareFacebookElement.setAttribute('target', '_blank');
        shareFacebookElement.setAttribute('alt', 'Share this demo on Facebook');
        shareFacebookElement.setAttribute('title', 'Share this demo on Facebook');

        shareTwitterElement = document.createElement('a');
        shareTwitterElement.setAttribute('class', 'ShareOnTwitterButton');
		shareTwitterElement.setAttribute('className', 'ShareOnTwitterButton');
        shareTwitterElement.setAttribute('href', shareTwitterUrl);
        shareTwitterElement.setAttribute('target', '_blank');
        shareTwitterElement.setAttribute('alt', 'Tweet a link to this demo');
        shareTwitterElement.setAttribute('title', 'Tweet a link to this demo');

        shareEmailElement = document.createElement('a');
        shareEmailElement.setAttribute('class', 'ShareViaEmailButton');
		shareEmailElement.setAttribute('className', 'ShareViaEmailButton');
        shareEmailElement.setAttribute('href', shareEmailURL);
        shareEmailElement.setAttribute('target', '_blank');
        shareEmailElement.setAttribute('alt', 'Email a link to this demo');
        shareEmailElement.setAttribute('title', 'Email a link to this demo');

        containerElement.appendChild(returnElement);

        containerElement.appendChild(shareFacebookElement);
        containerElement.appendChild(shareTwitterElement);
        containerElement.appendChild(shareEmailElement);
	}

    if (window.addEventListener) {
        window.addEventListener('DOMContentLoaded', configureUI, false);
    } else {
        window.attachEvent('onload', configureUI);
    }

} ());
