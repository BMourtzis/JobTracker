var facade;

var ctrl = {};

ctrl.ctrlName = "Clients";
ctrl.templateDir = "../Templates/";

//Shows a table of all the clients
ctrl.index = function() {
    facade.getAllClients().then(function(query) {

        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/index.html");
        var temp = jsrender.templates(templatePath);
        var data = {
            clients: query
        };
        var html = temp(data);
        $("#content").html(html);

        $("#create-button").click(function(){ctrl.create();});
        $("#client-table button").click(function(){ctrl.details($(this).data("id"));});
    });

    contentManager.restartLineup(ctrl.ctrlName, "index", ctrl.index.bind(this));
};

//TODO: fix long names
//Shows client the selected client on the sidebar
ctrl.details = function(id) {
    $("#sidebar-heading").html("Client Details");
    sidebarManager.add(ctrl.ctrlName, "details", ctrl.details.bind(this), id);
    return facade.getClientFull(id).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/details.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);
        $("#sidebar").html(html);

        $("#edit-button").click(function(){ctrl.edit(id);});
        $("#create-jobscheme-button").click(function(){ctrls.JobSchemes.create(id);});
        $("#create-job-button").click(function(){ctrls.Jobs.create(id);});
        $("#create-invoice-button").click(function(){ctrls.Invoices.create(id);});
        $("#see-all-jobs-button").click(function(){ctrls.Jobs.getClientJobs(id);});
        $("#see-all-schemes-button").click(function(){ctrls.JobSchemes.getClientSchemes(id);});
        $("#see-all-invoices-button").click(function(){ctrls.Invoices.getClientInvoices(id);});
        $("#delete-button").click(function(){
            new Promise(function(resolve, reject){
                $("#deleteConfirmationModal").on('hidden.bs.modal', function (e) {
                    resolve();
                });
            }).then(function(){
                remove(id);
            });
        });
        getClientStats(id);
    });
};

function getClientStats(clientId) {
    getJobCount(clientId);
    getJobPendingCount(clientId);
    getSchemeCount(clientId);
    getSchemeActiveCount(clientId);
    getSchemeActiveTotal(clientId);
    getInvoiceCount(clientId);
    getInvoicePendingCount(clientId);
    getInvoicePaidTotal(clientId);
    getInvoicePendingTotal(clientId);
}

function getJobCount(clientId) {
    return facade.getJobCount(clientId).then(function(count){
        $("#client-no-jobs").html(count);
    });
}

function getJobPendingCount(clientId) {
    return facade.getPendingJobCount(clientId).then(function(count){
        $("#client-pending-jobs").html(count);
    });
}

function getSchemeCount(clientId) {
    return facade.getJobSchemeCount(clientId).then(function(count){
        $("#client-no-services").html(count);
    });
}

function getSchemeActiveCount(clientId) {
    return facade.getActiveJobSchemeCount(clientId).then(function(count){
        $("#client-active-services").html(count);
    });
}

function getSchemeActiveTotal(clientId) {
    return facade.getActiveJobSchemeSum(clientId).then(function(sum){
        $("#client-total-services").html("$"+sum);
    });
}

function getInvoiceCount(clientId) {
    return facade.getInvoiceCount(clientId).then(function(count) {
        $("#client-no-invoices").html(count);
    });
}

function getInvoicePendingCount(clientId) {
    return facade.getPendingInvoiceCount(clientId).then(function(count) {
        $("#client-pending-invoices").html(count);
    });
}

function getInvoicePaidTotal(clientId) {
    return facade.getPaidSum(clientId).then(function(sum) {
        $("#client-total-paid-invoices").html("$"+sum);
    });
}

function getInvoicePendingTotal(clientId) {
    return facade.getPendingSum(clientId).then(function(sum) {
        $("#client-total-pending-invoices").html("$"+sum);
    });
}

//Displays the create client page
ctrl.create = function() {
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/create.html");
    var temp = jsrender.templates(templatePath);

    sidebarManager.add(ctrl.ctrlName, "create", ctrl.create.bind(this));
    $("#sidebar-heading").html("Create Client");
    $("#sidebar").html(temp);

    $("#form-submit-button").click(function(){create();});
};

//Creates a new Client with the field values
function create() {
    var formData = $("#createClientForm").serializeArray();
    formData[1].value = formData[1].value.toUpperCase();
    if(formData[5].value === "") { formData[5].value = null; }
    formData[6].value =  parseInt(formData[6].value);
    if(Number.isNaN(formData[6].value)){ formData[6].value = null; }

    facade.createClient(formData[2].value, formData[3].value, formData[0].value, formData[1].value, formData[4].value, formData[5].value, formData[6].value).then(function(data) {
        data = data.get({plain: true});
        sidebarManager.pop();
        contentManager.reload();
        ctrl.details(data.id);
    }, function(err){
        if(err.errors[0].message === "shortname must be unique" ) {
            $.notify({
                //options
                icon: 'glyphicon glyphicon-warning-sign',
                message: "Short Name is taken. Please change it."
            },{
                //settings
                type: "danger",
                delay: 10000
            });
        }

    });
}

//Displays the create client page
ctrl.edit = function(id) {
    facade.getClient(id).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/edit.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);

        sidebarManager.add(ctrl.ctrlName, "edit", ctrl.edit.bind(this), id);
        $("#sidebar-heading").html("Edit Client");
        $("#sidebar").html(html);

        $("#form-submit-button").click(function(){edit(id);});
    });
};

//Edit a Client with the field values
function edit(id) {
    var formData = $("#editClientForm").serializeArray();
    formData[1].value = formData[1].value.toUpperCase();

    facade.editClient(id, formData).then(function(){
        sidebarManager.pop();
        contentManager.reload();
        ctrl.details(id);
    }, function(err){
        if(err.errors[0].message === "shortname must be unique" ) {
            $.notify({
                //options
                icon: 'glyphicon glyphicon-warning-sign',
                message: "Short Name is taken. Please change it."
            },{
                //settings
                type: "danger",
                delay: 10000
            });
        }
    });
}

function remove(id) {
    facade.removeClient(id).then(function(){
        sidebarManager.goBack();
        contentManager.reload();
    });
}

module.exports = function getController() {
    return require('../scripts/Facade.js')().then(function(data){
        facade = data;
        return ctrl;
    });
};
