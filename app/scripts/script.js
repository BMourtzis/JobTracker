var uiFunctions = { };

uiFunctions.ContrDir = "../Controller/";

uiFunctions.home = function() {
    ctrl.Home.index();
    uiFunctions.changeActive(0);
};

uiFunctions.jobs = function() {
    ctrl.Jobs.index();
    uiFunctions.changeActive(1);
};
uiFunctions.getCreateJob = function() { ctrl.Jobs.getCreateJob(); };
uiFunctions.getCreateJob = function(id) { ctrl.Jobs.getCreateJob(id); };
uiFunctions.createJob = function() { ctrl.Jobs.createJob(); };
uiFunctions.removeJob = function(id, clientID) { ctrl.Jobs.removeJob(id,clientID); };
uiFunctions.jobDetails = function(id) { ctrl.Jobs.jobDetails(id); };
uiFunctions.getEditJob = function(id) { ctrl.Jobs.getEditJob(id); };
uiFunctions.editJob = function(id) { ctrl.Jobs.editJob(id); };

uiFunctions.clients = function() {
    ctrl.Clients.index();
    uiFunctions.changeActive(2);
};
uiFunctions.getCreateClient = function() { ctrl.Clients.getCreateClient(); };
uiFunctions.createClient = function() { ctrl.Clients.createClient(); };
uiFunctions.clientDetails = function(id) { ctrl.Clients.clientDetails(id); };
uiFunctions.getEditClient = function(id) { ctrl.Clients.getEditClient(id); };
uiFunctions.editClient = function(id) { ctrl.Clients.editClient(id); };

uiFunctions.getCreateJobScheme = function(id) { ctrl.JobsSchemes.getCreateJobScheme(id); };
uiFunctions.createJobScheme = function() { ctrl.JobsSchemes.createJobScheme(); };
uiFunctions.addRepValues = function() { ctrl.JobsSchemes.addRepValues(); };
uiFunctions.removeRepValues = function(data) {
    $(data).parent().remove();
    ctrl.JobsSchemes.removeRepValues();
};
uiFunctions.jobSchemeDetails = function(id) { ctrl.JobSchemes.jobSchemeDetails(id); };
uiFunctions.generateJobs = function(id) { ctrl.JobSchemes.generateJobs(id); };


uiFunctions.Timetable = function() {
    uiFunctions.changeActive(3);
};

uiFunctions.Finances = function() {
    uiFunctions.changeActive(4);
};

uiFunctions.Settings = function() {
    uiFunctions.changeActive(5);
};

uiFunctions.changeActive = function(itemNo) {
    var listItems = $("#navbar-list").children();
    listItems.each(function(no, data) {
        $(data).removeClass("active");
    });
    $(listItems[itemNo]).addClass("active");
};

module.exports = uiFunctions;
