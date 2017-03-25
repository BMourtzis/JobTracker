var facade;

var ctrl = {};


ctrl.ctrlName = "Clients";
ctrl.templateDir = "../Templates/";

/**
 * ctrl.index - Creates the index page of clients, showing a table of all the clients
 *
 * @returns {Promise} an empty promise
 */
ctrl.index = function() {
    contentManager.restartLineup(ctrl.ctrlName, "index", ctrl.index.bind(this));
    return facade.getAllClients().then(function(query) {

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
};


/**
 * ctrl.details - Shows client the selected client on the sidebar
 *
 * @param {number} clientId the Id of the client
 * @returns {Promise} an empty promise
 */
ctrl.details = function(clientId) {
    $("#sidebar-heading").html("Client Details");
    sidebarManager.add(ctrl.ctrlName, "details", ctrl.details.bind(this), clientId);
    return facade.getClient(clientId).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/details.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);
        $("#sidebar").html(html);

        //Add click functinality
        $("#edit-button").click(function(){ctrl.edit(clientId);});
        $("#create-jobscheme-button").click(function(){ctrls.JobSchemes.create(clientId);});
        $("#create-job-button").click(function(){ctrls.Jobs.create(clientId);});
        $("#create-invoice-button").click(function(){ctrls.Invoices.create(clientId);});
        $("#see-all-jobs-button").click(function(){ctrls.Jobs.getClientJobs(clientId);});
        $("#see-all-schemes-button").click(function(){ctrls.JobSchemes.getClientSchemes(clientId);});
        $("#see-all-invoices-button").click(function(){ctrls.Invoices.getClientInvoices(clientId);});
        $("#delete-button").click(function(){
            new Promise(function(resolve, reject){
                $("#deleteConfirmationModal").on('hidden.bs.modal', function (e) {
                    resolve();
                });
            }).then(function(){
                remove(clientId);
            });
        });
        getClientStats(clientId);
    });
};


/**
 * getClientStats- Calls the functions below to populate the client's stats
 *
 * @param clientId The Id of the client
 */
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

/**
 * getJobCount - Gets the number of jobs that belong to the client for the client
 *
 * @param clientId the Id of the client
 * @returns an empty promise
 */
function getJobCount(clientId) {
    return facade.getJobCount(clientId).then(function(count){
        $("#client-no-jobs").html(count);
    });
}


/**
 * getJobPendingCount - Gets the number of peding jobs for the client
 *
 * @param  {number} clientId the Id of the client
 * @return {Promise}          an empty promise
 */
function getJobPendingCount(clientId) {
    return facade.getPendingJobCount(clientId).then(function(count){
        $("#client-pending-jobs").html(count);
    });
}


/**
 * getSchemeCount - Get the number of jobSchemes (Services) for the client
 *
 * @param  {number} clientId the id of the client
 * @return {Promise}          an empty promise
 */
function getSchemeCount(clientId) {
    return facade.getJobSchemeCount(clientId).then(function(count){
        $("#client-no-services").html(count);
    });
}


/**
 * getSchemeActiveCount - Gets the number of active (enabled) jobSchemes for the client
 *
 * @param  {number} clientId the id of the client
 * @return {Promise}          an empty promise
 */
function getSchemeActiveCount(clientId) {
    return facade.getActiveJobSchemeCount(clientId).then(function(count){
        $("#client-active-services").html(count);
    });
}


/**
 * getSchemeActiveTotal - Gets the sum of the active jobSchemes for the client
 *
 * @param  {number} clientId the id of the client
 * @return {Promise}          an empty promise
 */
function getSchemeActiveTotal(clientId) {
    return facade.getActiveJobSchemeSum(clientId).then(function(sum){
        if(Number.isNaN(sum)) {sum = 0;}
        sum = numberFormatter(sum).format();
        $("#client-total-services").html(sum);
    });
}

// TODO: get the total number of paid invoices
/**
 * getInvoiceCount - Gets the number of invoices for the client
 *
 * @param  {number} clientId the id of the client
 * @return {Promise}          an empty promise
 */
function getInvoiceCount(clientId) {
    return facade.getInvoiceCount(clientId).then(function(count) {
        $("#client-no-invoices").html(count);
    });
}


/**
 * getInvoicePendingCount - Gets the number of pending invoices for the client
 *
 * @param  {number} clientId the id of the client
 * @return {Promise}          an empty promise
 */
function getInvoicePendingCount(clientId) {
    return facade.getPendingInvoiceCount(clientId).then(function(count) {
        $("#client-pending-invoices").html(count);
    });
}


/**
 * getInvoicePaidTotal - Gets the sum of the paid invoices for the client
 *
 * @param  {number} clientId the Id of the client
 * @return {Promise}          an empty promise
 */
function getInvoicePaidTotal(clientId) {
    return facade.getPaidSum(clientId).then(function(sum) {
        if(Number.isNaN(sum)) {sum = 0;}
        sum = numberFormatter(sum).format();
        $("#client-total-paid-invoices").html(sum);
    });
}


/**
 * getInvoicePendingTotal - Gets the sum of the pending invoices  for the client
 *
 * @param  {number} clientId the id of the client
 * @return {Promise}          an empty promise
 */
function getInvoicePendingTotal(clientId) {
    return facade.getPendingSum(clientId).then(function(sum) {
        if(Number.isNaN(sum)) {sum = 0;}
        sum = numberFormatter(sum).format();
        $("#client-total-pending-invoices").html(sum);
    });
}

/**
 * ctrl.create - Displays the create client page
 */

ctrl.create = function() {
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/create.html");
    var temp = jsrender.templates(templatePath);

    sidebarManager.add(ctrl.ctrlName, "create", ctrl.create.bind(this));
    $("#sidebar-heading").html("Create Client");
    $("#sidebar").html(temp);

    $("#form-submit-button").click(function(){create();});
};

//

/**
 * create - Creates a new Client with the field values
 *
 * @return {Promise}  an empty promise
 */
function create() {
    var formData = $("#createClientForm").serializeArray();
    formData[1].value = formData[1].value.toUpperCase();
    if(formData[5].value === "") { formData[5].value = null; }
    formData[6].value =  parseInt(formData[6].value);
    if(Number.isNaN(formData[6].value)){ formData[6].value = null; }

    return facade.createClient(formData[2].value, formData[3].value, formData[0].value, formData[1].value, formData[4].value, formData[5].value, formData[6].value).then(function(data) {
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

/**
 * ctrl.edit - Displays the create client page
 *
 * @param  {number} id the id of the client
 * @return {Promise}    an empty promise
 */

ctrl.edit = function(id) {
    return facade.getClient(id).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/edit.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);

        sidebarManager.add(ctrl.ctrlName, "edit", ctrl.edit.bind(this), id);
        $("#sidebar-heading").html("Edit Client");
        $("#sidebar").html(html);

        $("#form-submit-button").click(function(){edit(id);});
    });
};

/**
 * edit - Edit a Client with the field values
 *
 * @param  {number} id the id of the client
 * @return {Promise}    an empty promise
 */
function edit(id) {
    var formData = $("#editClientForm").serializeArray();
    formData[1].value = formData[1].value.toUpperCase();

    return facade.editClient(id, formData).then(function(){
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

/**
 * remove - Removes a client
 *
 * @param  {number} id the id of the client
 * @return {Promise}    an empty promise
 */
function remove(id) {
    return facade.removeClient(id).then(function(){
        sidebarManager.goBack();
        contentManager.reload();
    });
}

//TODO: make facade global

/**
 * initiateController - initiates the controller
 *
 * @return {Object}  Client controller
 */
 function initiateController() {
     return require('../scripts/Facade.js').then(function(data){
         facade = data;
         return ctrl;
     });
 }
module.exports = initiateController();
