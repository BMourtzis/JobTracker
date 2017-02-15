var uiFunctions = { };

uiFunctions.ContrDir = "../Controller/";

uiFunctions.home = function() {
    ctrl.Home.index();
    uiFunctions.changeActive(0);
};
uiFunctions.homeJobDone = function(id) { ctrl.Home.done(id); };
uiFunctions.homeJobUndone = function(id) { ctrl.Home.undone(id); };
uiFunctions.previousDay = function() { ctrl.Home.previousDay(); };
uiFunctions.nextDay = function() { ctrl.Home.nextDay(); };

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
uiFunctions.getRebookJob = function(id) { ctrl.Jobs.getRebookJob(id); };
uiFunctions.rebookJob = function(id) { ctrl.Jobs.rebookJob(id); };
uiFunctions.jobDone = function(id) { ctrl.Jobs.done(id); };
uiFunctions.jobInvoiced = function(id) { ctrl.Jobs.invoice(id); };
uiFunctions.jobPaid = function(id) { ctrl.Jobs.paid(id); };
uiFunctions.searchJobs = function() { ctrl.Jobs.searchJobs(); };

uiFunctions.clients = function() {
    ctrl.Clients.index();
    uiFunctions.changeActive(2);
};
uiFunctions.getCreateClient = function() { ctrl.Clients.getCreateClient(); };
uiFunctions.createClient = function() { ctrl.Clients.createClient(); };
uiFunctions.clientDetails = function(id) { ctrl.Clients.clientDetails(id); };
uiFunctions.getEditClient = function(id) { ctrl.Clients.getEditClient(id); };
uiFunctions.editClient = function(id) { ctrl.Clients.editClient(id); };

uiFunctions.getCreateJobScheme = function(id) { ctrl.JobSchemes.getCreateJobScheme(id); };
uiFunctions.createJobScheme = function() { ctrl.JobSchemes.createJobScheme(); };
uiFunctions.addRepValues = function() { ctrl.JobSchemes.addRepValues(); };
uiFunctions.removeRepValues = function(data) {
    $(data).parent().remove();
    ctrl.JobSchemes.removeRepValues();
};
uiFunctions.jobSchemeDetails = function(id) { ctrl.JobSchemes.jobSchemeDetails(id); };
uiFunctions.generateJobs = function(id) { ctrl.JobSchemes.generateNextMonthsJobs(id); };
uiFunctions.updateRepFields = function() { ctrl.JobSchemes.changeRepFields(); };
uiFunctions.disableJobScheme = function(id){ ctrl.JobSchemes.disableJobScheme(id); };
uiFunctions.enableJobScheme = function(id){ ctrl.JobSchemes.enableJobScheme(id); };

uiFunctions.Timetable = function() {
    uiFunctions.changeActive(3);
    ctrl.Misc.comingsoon();
};

uiFunctions.Finances = function() {
    uiFunctions.changeActive(4);
    ctrl.Misc.comingsoon();
};

uiFunctions.Settings = function() {
    uiFunctions.changeActive(5);
    ctrl.Misc.comingsoon();
};

uiFunctions.changeActive = function(itemNo) {
    var listItems = $("#navbar-list").children();
    listItems.each(function(no, data) {
        $(data).removeClass("active");
    });
    $(listItems[itemNo]).addClass("active");
};

module.exports = uiFunctions;
