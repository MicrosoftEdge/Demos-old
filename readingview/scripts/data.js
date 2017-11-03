var ReadingView = ReadingView || {};
ReadingView.data = ReadingView.data || {};

(function () {
	'use strict';
	var infoBoxContent = {
		'web-title': {
			title: 'Title',
			eleName: 'Title',
			code: '&#60;head&#62; <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#60;title&#62; Article title &#60;&#47;title&#62; <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#60;meta name = &#34;title&#34; content = &#34;This is the title!&#34;&#62; <br>&#60;&#47;head&#62; <br><br>&#60;body&#62; <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#60;h1&#62; This is the title! &#60;&#47;h1&#62; <br>&#60;&#47;body&#62;',
			rawCode: '<!-- < head > --> \n <title> Article title </title>\n <meta name = "title" content ="This is the title!">\n \n<!-- < body > -->\n \n < h1 > This is the title! < /h1>',
			explanation: '<p class="infoChild">To ensure Reading View renders your article&#39;s title, we recommend you </p><ol class="fitList"><li class="infoChild"> Include a < title >  element in your header </li><li class="infoChild"> Include a meta tag with the name &#34;title&#34; </li><li class="info-child"> Have the title text in your article body match the content string exactly.   </li></ol>'
		},
		'web-date': {
			title: 'Date',
			eleName: 'Date',
			code: '<p class="infoChild">&#60;&#33;&#45;&#45;If you have a Date in your article body and would like Reading View to render it, then the element holding the Date text should include a class = &#34;dateline&#34;&#45;&#45;&#62; </p> <p class="infoChild">&#60;div class = &#34;dateline&#34;&#62; Wednesday, September 18, 2013 7:38 AM &#60;&#47;div&#62;</p><p class="info-child">&#60;&#33;&#45;&#45;If you do not have a Date in the article body, use the meta tag &#34;displaydate.&#34;&#45;&#45;&#62;   </p>&#60;meta name = &#34;displaydate&#34; content=&#34; Wednesday, September 18, 2013 7:38 AM &#34;&#62;',
			rawCode: '<!-- If you have a Date in your article body and would like Reading View to render it, then the element holding the Date text should include a class = "dateline" --> \n\n<div class = "dateline"> Wednesday, September 18, 2013 7:38 AM </div>\n \n<!--  If you do not have a Date in the article body but would like Reading View to render the date, use the meta tag "displaydate."--> \n\n<meta name = "displaydate" content=" Wednesday, September 18, 2013 7:38 AM ">',
			explanation: 'Reading View will render the publisher and date information together on the same line, with additional styling to highlight this information. The article&#39;s publishing date will render exactly as it appears in the string. Reading View does not convert to a specific date format.'
		},
		'web-author': {
			title: 'Author',
			eleName: 'Author',
			code: '&#60;div class=&#34;byline-name&#34;&#62; Author name &#60;&#47;div&#62;',
			rawCode: '<div class="byline-name">Author name</div>',
			explanation: 'Reading View will look for an element with class = &#34;byline-name.&#34; We recommend that you place the Author name after the title and before the article body.'
		},
		'web-publisher': {
			title: 'Publisher',
			eleName: 'Publisher',
			code: '&#60;meta property = &#34;og:site_name&#34; content = &#34;Name of organization source&#34;&#62;',
			rawCode: '<meta property = "og:site_name" content = "Name of organization source">',
			explanation: 'Reading View will look for the Open Graph protocol &#34;og:site_name&#34; to render the publisher information. It also looks for &#34;source_organization&#34; and &#34;publisher&#34; attributes in any html tag as a secondary indicator of publisher information on the page. The Publisher text will be hyperlinked to the URL of page, using Reading View page\'s hyperlink style'
		},
		'web-dominant-image': {
			title: 'Dominant Image',
			eleName: 'DominantImage',
			code: '',
			rawCode: '',
			explanation: '<p class="infoChild">Reading View captures most raw images that meet dimension requirements: Width &#62;= 400 px and Aspect Ratio &#62;= 1&#47;3 and =&#60; 3.0. Images that do not meet these dimensions may still be extracted, such as images that are smaller than 400px in width but have captions. </p><p>We also recommend that you place images in &#60;figure&#62; tags with no more than two &#60;figcaption&#62; tags nested within. </p><p class="info-child">The first eligible image becomes the dominant image of the article. The dominant image is rendered as the first piece of content and given full column width. All following images are rendered as inline images within the article.</p>'
		},
		'web-inline-image': {
			title: 'Inline Images',
			eleName: 'InlineImage',
			code: '',
			rawCode: '',
			explanation: '<p class="infoChild">Reading View captures most raw images that meet these dimension requirements: Width &#62;= 400 px and Aspect Ratio &#62;= 1&#47;3 and =&#60; 3.0</p><p class="infoChild">Images that do not meet these dimensions may still be extracted, such as images that are smaller than 400px in width but have captions. </p><p class="info-child">All images after the Dominant Image are rendered as inline images within the article body. If the image width is half the width of the column or less, then we will wrap text around it</p>'
		},
		'web-fig-caption': {
			title: 'Captions',
			eleName: 'FigCaption',
			code: '&#60;figcaption&#62; caption here &#60;figcaption&#62; ',
			rawCode: '<figcaption> caption here </figcaption>',
			explanation: '<p class="info-child">We recommend no more than two &#60;figcaption&#62; tags nested within the &#60;figure&#62 tag.</p>'
		},
		'web-copyright': {
			title: 'Copyright',
			eleName: 'Copyright',
			code: '&#60;meta name =&#34;copyright&#34; content=&#34;This is the copyright information&#34;&#62;',
			rawCode: '<meta name ="copyright" content="Your copyright information">',
			explanation: 'Reading view extracts and displays copyright information denoted by meta tag = &#34;copyright&#34;, or if no meta tag information exists a text node that contains the copyright (&#34;&#169;&#34;) symbol. Reading view displays copyright information at the end of the article main body, styled using a smaller font size than the main body text.'
		},
		webBody: {
			title: 'Body',
			eleName: 'Body',
			code: '',
			rawCode: '',
			explanation: 'If you want to ensure that all your article body text is captured by Reading View, it helps to keep most of the article text the same font size and DOM depth. The reading view algorithm allows for some deviation from this rule so publishers can have the freedom to add emphasis to lines or words.'

		},
		webOptOut: {
			title: 'Opt Out',
			eleName: 'OptOut',
			code: '',
			rawCode: '<meta name="IE_RM_OFF" content="true">',
			explanation: '<p class="info-child">For page owners who feel their content is not a good fit for Reading View, we offer a tag to opt out of Reading View. Once implemented, the Reading View icon will not appear in the address bar</p>'
		}
	};

	ReadingView.data.webReadingViewElementsIDs = ['web-title', 'web-dominant-image', 'web-fig-caption', 'web-date', 'web-author', 'web-publisher', 'web-copyright', 'web-inline-image'];
	ReadingView.data.readingViewElementsIDs = ['td-title', 'td-dominant-image', 'td-fig-caption', 'td-date', 'td-author', 'td-publisher', 'td-inline-image', 'td-copyright'];
	ReadingView.data.navBarElementsIDs = ['nav-title', 'nav-dominant-image', 'nav-inline-image', 'nav-fig-caption', 'nav-date', 'nav-author', 'nav-publisher', 'nav-copyright'];
	//maintain button states
	ReadingView.data.clickedNavID = '';
	ReadingView.data.infoBoxContent = infoBoxContent;
}());
