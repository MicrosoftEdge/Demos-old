(function($) {

    function scrollTo(top) {
        $('html, body').animate({ scrollTop: top}, 800, 'easeInOutCirc');
    }

    $('#top').click(function() {
        scrollTo(0);
    });

    $('#introTiles').click(function() {
        var id = $(this).attr('href'),
            offset = $('#page01').offset().top;
        scrollTo(offset);
        return false;
    });

    $(window).scroll(function(e) {
        var top = $('body').scrollTop(),
            height = $(window).height();
        $('#top').toggleClass('showing', top > height);
    });

})(jQuery);

