var ctrl = {
    Clients: require("./Clients.js"),
    Jobs: require("./Jobs.js"),
    JobSchemes: require("./JobSchemes.js"),
    Invoices: require("./Invoices.js"),
    Misc: require("./Misc.js")
};

module.exports = function getControllers() {
    var home =  require("./Home.js")().then(function(data){
        ctrl.Home = data;
    });

    var clients =  require("./Clients.js")().then(function(data){
        ctrl.Clients = data;
    });

    var jobs =  require("./Jobs.js")().then(function(data){
        ctrl.Jobs = data;
    });

    var jobSchemes =  require("./JobSchemes.js")().then(function(data){
        ctrl.JobSchemes = data;
    });

    var invoices =  require("./Invoices.js")().then(function(data){
        ctrl.Invoices = data;
    });

    ctrl.Misc =  require("./Misc.js");

    return Promise.all([home, clients, jobs, jobSchemes, invoices]).then(function(data){
        return ctrl;
    });
};
