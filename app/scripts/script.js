var ctrl = require("../Controller/Controllers.js");

var uiFunctions = { };

uiFunctions.ContrDir = "../Controller/";

uiFunctions.home = function() {
    ctrl.Home.index();
    uiFunctions.changeActive(0);
};
uiFunctions.homeJobDone = function(id) { ctrl.Home.done(id); };
uiFunctions.homeJobUndone = function(id) { ctrl.Home.placed(id); };
uiFunctions.previousDay = function() { ctrl.Home.previousDay(); };
uiFunctions.nextDay = function() { ctrl.Home.nextDay(); };
uiFunctions.reloadDayJobs = function() { ctrl.Home.loadDayJobs(); };

uiFunctions.jobs = function() {
    ctrl.Jobs.index();
    uiFunctions.changeActive(1);
};
uiFunctions.getCreateJob = function() { ctrl.Jobs.getCreateJob(); };
uiFunctions.getCreateJob = function(id) { ctrl.Jobs.getCreateJob(id); };
uiFunctions.createJob = function() { ctrl.Jobs.createJob(); };
uiFunctions.removeJob = function(id, clientID) {
    $("#deleteConfirmationModal").modal('hide');
    ctrl.Jobs.removeJob(id,clientID);
};
uiFunctions.jobDetails = function(id) { ctrl.Jobs.jobDetails(id); };
uiFunctions.getEditJob = function(id) { ctrl.Jobs.getEditJob(id); };
uiFunctions.editJob = function(id) { ctrl.Jobs.editJob(id); };
uiFunctions.getRebookJob = function(id) { ctrl.Jobs.getRebookJob(id); };
uiFunctions.rebookJob = function(id) { ctrl.Jobs.rebookJob(id); };

uiFunctions.jobDone = function(id) { ctrl.Jobs.done(id); };
uiFunctions.jobInvoiced = function(id) { ctrl.Jobs.invoice(id); };
uiFunctions.jobPaid = function(id) { ctrl.Jobs.paid(id); };

uiFunctions.jobListDone = function() { ctrl.Jobs.jobListDone(); };
uiFunctions.jobListInvoiced = function() { ctrl.Jobs.jobListInvoiced(); };
uiFunctions.jobListPaid = function() { ctrl.Jobs.jobListPaid(); };
uiFunctions.jobListDelete = function() { ctrl.Jobs.bulkDelete(); };

uiFunctions.searchJobs = function() {
    $("#advSearchModal").modal('hide');
    ctrl.Jobs.searchJobs();
};
uiFunctions.gotoJobPage = function(page) { ctrl.Jobs.gotoPage(page); };
uiFunctions.updateJobSelectedList = function() { ctrl.Jobs.updateSelectedList(); };
uiFunctions.updateAllCheckboxes = function() { ctrl.Jobs.updateAllCheckboxes(); };

uiFunctions.services = function() {
    ctrl.Misc.comingsoon();
    uiFunctions.changeActive(2);
};

uiFunctions.clients = function() {
    ctrl.Clients.index();
    uiFunctions.changeActive(3);
};
uiFunctions.getCreateClient = function() { ctrl.Clients.getCreateClient(); };
uiFunctions.createClient = function() { ctrl.Clients.createClient(); };
uiFunctions.clientDetails = function(id) { ctrl.Clients.clientDetails(id); };
uiFunctions.getEditClient = function(id) { ctrl.Clients.getEditClient(id); };
uiFunctions.editClient = function(id) { ctrl.Clients.editClient(id); };
uiFunctions.getClientJobs = function(id) {ctrl.Jobs.getClientJobs(id); };
uiFunctions.removeClient = function(id) {
    $("#deleteConfirmationModal").modal('hide');
    new Promise(function(resolve, reject){
        $(deleteConfirmationModal).on('hidden.bs.modal', function (e) {
            resolve();
        });
    }).then(function(){
        ctrl.Clients.removeClient(id);
    });
};

uiFunctions.getCreateJobScheme = function(id) { ctrl.JobSchemes.getCreateJobScheme(id); };
uiFunctions.createJobScheme = function() { ctrl.JobSchemes.createJobScheme(); };
uiFunctions.addRepValues = function() { ctrl.JobSchemes.addRepValues(); };
uiFunctions.removeRepValues = function(data) { ctrl.JobSchemes.removeRepValues(data); };
uiFunctions.jobSchemeDetails = function(id) { ctrl.JobSchemes.jobSchemeDetails(id); };
uiFunctions.removeJobScheme = function(id) {
    $("#deleteConfirmationModal").modal('hide');
    new Promise(function(resolve, reject){
        $(deleteConfirmationModal).on('hidden.bs.modal', function (e) {
            resolve();
        });
    }).then(function(){
        ctrl.JobSchemes.removeJobScheme(id);
    });
};
uiFunctions.generateJobs = function(id) {
    $("#generateJobsOptionsModal").modal('hide');
    new Promise(function(resolve, reject){
        $(generateJobsOptionsModal).on('hidden.bs.modal', function (e) {
            resolve();
        });
    }).then(function(){
        ctrl.JobSchemes.generateJobs(id);
    });
};
uiFunctions.generateNextMonthsJobs = function(id) { ctrl.JobSchemes.generateNextMonthsJobs(id); };
uiFunctions.updateRepFields = function() { ctrl.JobSchemes.changeRepFields(); };
uiFunctions.disableJobScheme = function(id) { ctrl.JobSchemes.disableJobScheme(id); };
uiFunctions.enableJobScheme = function(id) { ctrl.JobSchemes.enableJobScheme(id); };
uiFunctions.getEditJobScheme = function(id) { ctrl.JobSchemes.getEditJobScheme(id); };
uiFunctions.editJobScheme = function(id) { ctrl.JobSchemes.editJobScheme(id); };

uiFunctions.invoices = function() {
    uiFunctions.changeActive(4);
    ctrl.Invoices.index();
};
uiFunctions.invoicePaid = function(id) { ctrl.Invoices.invoicePaid(id); };
uiFunctions.invoiceInvoiced = function(id) { ctrl.Invoices.invoiceInvoiced(id); };
uiFunctions.getCreateInvoice = function() { ctrl.Invoices.getCreateInvoice(); };
uiFunctions.addYear = function() { ctrl.Invoices.addYear(); };
uiFunctions.subtractYear = function() { ctrl.Invoices.subtractYear(); };
uiFunctions.createInvoice = function() { ctrl.Invoices.createInvoice(); };
uiFunctions.printInvoice = function(id) { ctrl.Invoices.printInvoice(id); };
uiFunctions.deleteInvoice = function(id) {
    $("#deleteConfirmationModal").modal('hide');
    new Promise(function(resolve, reject){
        $(deleteConfirmationModal).on('hidden.bs.modal', function (e) {
            resolve();
        });
    }).then(function(){
        ctrl.Invoices.deleteInvoice(id);
    });
};
uiFunctions.searchOptions = function() {
    $("#advSearchModal").modal('hide');
    ctrl.Invoices.searchOptions();
};
uiFunctions.gotoInvoicePage = function(page) { ctrl.Invoices.gotoPage(page); };

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

uiFunctions.UpdateInvoiceTemplatePath = function() { ctrl.Settings.UpdateInvoiceTemplatePath(); };
uiFunctions.UpdateInvoiceOutputPath = function() { ctrl.Settings.UpdateInvoiceOutputPath(); };
uiFunctions.UpdateBackupPath = function() { ctrl.Settings.UpdateBackupPath(); };
uiFunctions.UpdateGSTPercentage = function() { ctrl.Settings.UpdateGSTPercentage(); };

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
