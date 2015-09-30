(function($) {

    function scrollTo(top) {
        $('html, body').animate({ scrollTop: top}, 800, 'easeInOutCirc');
    }

    $('#top').click(function() {
        scrollTo(0);
    });

    $('.tile').click(function() {
        var id = $(this).attr('href'),
            offset = $(id).offset().top;
        scrollTo($(id).offset().top);
        return false;
    });

    $(window).scroll(function(e) {
        var top = $('body').scrollTop(),
            height = $(window).height();
        $('#top').toggleClass('showing', top > height);
    });

})(jQuery);

