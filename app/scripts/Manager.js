function getManager(id, button) {
    var manager = {};
    var htmlid = "#"+id;
    var goBack = button;

    var lineUp = [];

    // TODO: add limitation on the number of stored steps. I'd say 30 is pretty good.

    manager.add = function(ctrl, name, func, params) {
        var lastitem = lineUp[lineUp.length-1];

        if(lineUp.length === 0 || lastitem.ctrl !== ctrl || lastitem.name !== name || lastitem.params !==  params) {
            lineUp.push({ctrl: ctrl, name: name, func: func, params: params});
        }
        manager.toggleGoBack();
    };

    manager.restartLineup = function(ctrl, name, func, params) {
        manager.empty();
        manager.add(ctrl, name, func, params);
        manager.toggleGoBack();
    };

    //TODO: fix goback from create, edit and rebook
    manager.goBack = function() {
        lineUp.pop();
        manager.reload();
        manager.toggleGoBack();
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

    manager.toggleGoBack = function() {
        if(goBack) {
            if(manager.getCount() > 0) {
                $("#goBack-button").show();
            }
            else {
                $("#goBack-button").hide();
            }
        }
    };

    manager.toggleGoBack();
    return manager;
}

module.exports = getManager;
