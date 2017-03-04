

function getManager(id) {
    var manager = {};
    var htmlid = "#"+id;

    var lineUp = [];

    manager.add = function(ctrl, name, func, params) {
        var lastitem = lineUp[lineUp.length-1];
        if(lineUp.length === 0 || lastitem.ctrl !== ctrl || lastitem.name !== name) {
            lineUp.push({ctrl: ctrl, name: name, func: func, params: params});
        }
    };

    manager.restartLineup = function(ctrl, name, func, params) {
        manager.empty();
        manager.add(ctrl, name, func, params);
    };

    manager.goBack = function() {
        lineUp.pop();
        manager.reload();
    };

    manager.reload = function() {
        if(lineUp.length > 0) {
            var item = lineUp[lineUp.length-1];
            item.func(item.params);
        }
        else {
            manager.removeHtml();
        }
    };

    manager.removeHtml = function() {
        $(htmlid).html("");
    };

    manager.empty = function() {
        lineUp = [];
    };

    manager.pop = function() {
        lineUp.pop();
    };

    manager.getCount = function() {
        return lineUp.length;
    };

    return manager;
}

module.exports = getManager;
