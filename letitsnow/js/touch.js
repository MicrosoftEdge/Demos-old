Touch = (function () {
    
    "use strict";

    // see http://blogs.msdn.com/b/ie/archive/2011/10/19/handling-multi-touch-and-mouse-input-in-all-browsers.aspx on details
    function preventEvents(evtObj) {
        // not needed anymore for Consumer Preview!

        /*
        if (evtObj.preventDefault)
            evtObj.preventDefault();

        if (evtObj.preventManipulation)
            evtObj.preventManipulation();

        if (evtObj.preventMouseEvent)
            evtObj.preventMouseEvent();
        */
    }

    return {
        "preventEvents": preventEvents
    }

})();