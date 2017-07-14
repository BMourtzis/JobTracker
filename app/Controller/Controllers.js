var ctrl = {};

module.exports = function getControllers(facade) {
    if(facade === undefined) {
        return require('../scripts/Facade.js')().then(function(data) {
            return initiateControllers(data);
        });
    }
    else {
        return Promise.resolve(function() {
            return initiateControllers(facade);
        });
    }
};

function initiateControllers(facade) {
    ctrl.Home = require("./Home.js")(facade);
    ctrl.Clients = require("./Clients.js")(facade);
    ctrl.Jobs = require("./Jobs.js")(facade);
    ctrl.JobSchemes = require("./JobSchemes.js")(facade);
    ctrl.Invoices = require("./Invoices.js")(facade);
    ctrl.Timetable = require("./Timetable.js")(facade);
    ctrl.Settings = require("./Settings.js")(facade);
    ctrl.Misc = require("./Misc.js");
    return ctrl;
}
