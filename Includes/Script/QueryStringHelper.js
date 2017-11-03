var $QueryStringHelper = {
    parse : function(variable)
    {
        var query = window.location.search.substring(1);
        var vars = query.split("&");

        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) {
                return pair[1].replace(/%20/g, " ");
            }
        }

        return false;
    }
}
