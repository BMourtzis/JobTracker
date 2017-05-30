function getManager(id, button) {
    var manager = {};
    var htmlid = "#" + id;
    var goBack = button;

    var lineUp = [];

    // TODO: add button id in the params instead of hardcoding
    // TODO: make internal used methods functions

    manager.add = function(ctrl, name, func, params) {
        var lastitem = lineUp[lineUp.length - 1];

        if (lineUp.length === 0 || lastitem.ctrl !== ctrl || lastitem.name !== name || lastitem.params !== params) {
            lineUp.push({
                ctrl: ctrl,
                name: name,
                func: func,
                params: params
            });
        }

        limitLineUp();
        manager.toggleGoBack();
    };

    manager.restartLineup = function(ctrl, name, func, params) {
        manager.empty();
        manager.add(ctrl, name, func, params);
        manager.toggleGoBack();
    };

    manager.goBack = function() {
        lineUp.pop();
        manager.reload();
        manager.toggleGoBack();
    };

    manager.reload = function() {
        if (lineUp.length > 0) {
            var item = lineUp[lineUp.length - 1];
            return item.func(item.params);
        } else {
            manager.removeHtml();
        }
    };

    manager.removeHtml = function() {
        $(htmlid).html("<h2>Click on an item for details</h2>");
        $("#sidebar-heading").html("");
    };

    manager.empty = function() {
        lineUp = [];
        manager.toggleGoBack();
    };

    manager.pop = function() {
        lineUp.pop();
    };

    manager.getCount = function() {
        return lineUp.length;
    };

    function limitLineUp() {
        if (lineUp.length > 30) {
            lineUp.splice(0, 1);
            manager.limitLineUp();
        }
    }

    manager.toggleGoBack = function() {
        if (goBack) {
            if (manager.getCount() > 0) {
                $("#goBack-button").show();
            } else {
                $("#goBack-button").hide();
            }
        }
    };

    manager.toggleGoBack();
    return manager;
}

module.exports = getManager;
