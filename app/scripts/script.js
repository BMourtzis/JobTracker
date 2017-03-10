var ctrl = require("../Controller/Controllers.js");

var uiFunctions = { };

uiFunctions.home = function() {
    ctrl.Home.index();
    uiFunctions.changeActive(0);
};

uiFunctions.jobs = function() {
    ctrl.Jobs.index();
    uiFunctions.changeActive(1);
};

uiFunctions.services = function() {
    ctrl.JobSchemes.index();
    uiFunctions.changeActive(2);
};

uiFunctions.clients = function() {
    ctrl.Clients.index();
    uiFunctions.changeActive(3);
};

uiFunctions.invoices = function() {
    uiFunctions.changeActive(4);
    ctrl.Invoices.index();
};

uiFunctions.timetable = function() {
    uiFunctions.changeActive(5);
    ctrl.Misc.comingsoon();
};

uiFunctions.finances = function() {
    uiFunctions.changeActive(6);
    ctrl.Misc.comingsoon();
};

uiFunctions.settings = function() {
    uiFunctions.changeActive(7);
    ctrl.Settings.index();
};

uiFunctions.goBack = function() { sidebarManager.goBack(); };

uiFunctions.changeActive = function(itemNo) {
    var listItems = $("#navbar-list").children();
    listItems.each(function(no, data) {
        $(data).removeClass("active");
    });
    $(listItems[itemNo]).addClass("active");
};

module.exports = function getScripts() {
    return require("../Controller/Controllers.js")().then(function(data) {
        ctrl = data;
        return uiFunctions;
    });
};
