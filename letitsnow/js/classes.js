Classes = (function () {
    
    "use strict";

    var _classesSeparator = " ";

    function _splitClasses(classesString) {
        return classesString.split(_classesSeparator);
    }

    function _joinClasses(classes) {
        return classes.join(_classesSeparator);
    }

    function _indexInClasses(className, classes) {
        if (!className || !classes || !classes.length)
            return false;
        return classes.indexOf(className);
    }

    function has(object, className) {
        if (!object || !object.className || !className)
            return;
        var cs = _splitClasses(object.className);
        return (_indexInClasses(className, cs) >= 0);
    }

    function add(object, className) {
        if (!object || !className)
            return;
        if (!object.className) {
            object.className = className;
        } else {
            var cs = _splitClasses(object.className);
            if (_indexInClasses(className, cs) === -1)
                cs.push(className);
            object.className = _joinClasses(cs);
        }
        return object.className;
    }

    function remove(object, className) {
        if (!object || !object.className || !className)
            return;
        if (object.className === className) {
            object.className = "";
        } else {
            var cs = _splitClasses(object.className);
            cs.splice(_indexInClasses(className, cs), 1);
            object.className = _joinClasses(cs);
        }
        return object.className;
    }

    function toggle(object, className) {
        if (!object || !className)
            return;
        if (has(object, className)) {
            remove(object, className);
        } else {
            add(object, className);
        }
    }

    return {
        "add": add,
        "remove": remove,
        "has": has,
        "toggle": toggle,
        "names": {
            "hidden": "hidden"
        }
    }

})();