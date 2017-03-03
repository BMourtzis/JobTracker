

function getManager() {
    var manager = {};

    var lineUp = [];

    manager.add = function(ctrl, name, func) {
        var lastitem = lineUp[lineUp.length-1];
        if(lineUp.length === 0 || lastitem.ctrl !== ctrl || lastitem.name !== name) {
            lineUp.push({ctrl: ctrl, name: name, func: func});
        }
        console.log(lineUp);
    };

    manager.restartLineup = function(ctrl, name, func) {
        manager.empty();
        manager.add(ctrl, name, func);
    };

    manager.goBack = function() {
        lineUp.pop();
        if(lineUp.length > 0) {
            manager.reload();
        }
        else {
            $("#sidebar").html("");
        }
    };

    manager.reload = function() {
        lineUp[lineUp.length-1].func();
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
