var clientRegister;
var jobRegister;
var schemeRegister;
var invoiceRegister;
var settingsRegister;

var facade = { };

//TODO: add backup functionality

//Client Functions
////Get all Clients
facade.getAllClients = function() {
    return clientRegister.getAllClients();
};

////Search Functions
//////Simple Search
facade.getClient = function(id){
    return clientRegister.getClient(id);
};

//////Get the client including the job and jobSchemes
facade.getClientFull = function(id) {
    return clientRegister.getClientFull(id);
};

//////Advanced Search
// facade.findClients = function(searchParams) {
//   return orm.Client.findAll({
//     where: searchParams
//   });
// }

////Create Functions
facade.createClient = function(firstname, lastname, businessname, shortname, address, email, phone) {
    return clientRegister.createClient(firstname, lastname, businessname, shortname, address, email, phone);
};

////Edit Function
facade.editClient = function(id, data){
    return clientRegister.editClient(id, data);
};

facade.removeClient = function(id){
    return clientRegister.removeClient(id);
};

//Job Functions
////Get all Clients
facade.getAllJobs = function(){
    return jobRegister.getAllJobs();
};

////Search Functions
//////Simple Search
facade.getJob =  function(id) {
    return jobRegister.getJob(id);
};

//////Get a job that includes the client
facade.getJobFull = function(id){
    return jobRegister.getJobFull(id);
};

//////Advanced Search
facade.getDayJobs = function(from) {
    return jobRegister.getDayJobs(from);
};

//////Get Jobs that belong to the specified client
facade.getClientJobs = function(searchParams, orderParams, page){
    return jobRegister.getClientJobs(searchParams, orderParams, page);
};

//////Get jobs for the month given
facade.getMonthJobs = function(clientId, date){
    return jobRegister.getMonthJobs(clientId, date);
};

//////Get jobs based on the given search params
facade.searchJobs = function(searchParams, orderParams, page) {
    return jobRegister.searchJobs(searchParams, orderParams, page);
};

//////Returns the number of pages
facade.getJobPageCount = function(searchParams){
    return getJobPageCount(searchParams);
};

////Create Functions
facade.createJob = function(jobname, timebooked, payment, clientid) {
    return jobRegister.createJob(jobname, timebooked, payment, clientid);
};

////Edit Function
facade.editJob = function(id, data){
    return jobRegister.editJob(id, data);
};

////State Machine for single objects

//////Changes the state to placed
facade.placed = function(id){
    return jobRegister.placed(id);
};

//////Changes the state to done
facade.done = function(id){
    return jobRegister.done(id);
};

//NOTE: Maybe I won't need these
//////Changes the state to invoice
facade.invoice = function(id) {
    return jobRegister.invoice(id);
};

//////Changes the state to paid
facade.paid = function(id){
    return jobRegister.paid(id);
};

//List State Machine
//////Changes the state to done
facade.jobListDone = function(idList) {
    return jobRegister.jobListDone(idList);
};

//////Changes the state to inboiced
facade.jobListInvoiced = function(idList) {
    return jobRegister.jobListInvoiced(idList);
};

//////Changes the state to paid
facade.jobListPaid = function(idList) {
    return jobRegister.jobListPaid(idList);
};

////Remove Functions
//////Removes a single job object
facade.removeJob = function(id){
    return jobRegister.removeJob(id);
};

//////Removed a list of job objects
facade.bulkDeleteJobs = function(idList) {
    return jobRegister.bulkDeleteJobs(idList);
};

//JobScheme Functions
////Search Functions
//////Simple Search
facade.getJobScheme = function(id) {
    return schemeRegister.getJobScheme(id);
};

//////Gets the specified jobScheme and includes the client
facade.getJobSchemeFull = function(id){
    return schemeRegister.getJobSchemeFull(id);
};

//////Advanced Search
// facade.findJobSchemes = function(searchParams) {
//   return orm.JobScheme.findAll({
//     where: searchParams
//   });
// }

////Create Functions
facade.createJobScheme = function(jobname, payment, repetition, repetitionvalues, clientid) {
    return schemeRegister.createJobScheme(jobname, payment, repetition, repetitionvalues, clientid);
};

////Edit Function
facade.editJobScheme = function(id, data){
    return schemeRegister.editJobScheme(id, data);
};

facade.removeJobScheme = function(id) {
    return schemeRegister.removeJobScheme(id);
};

facade.disableJobScheme = function(id) {
    return schemeRegister.disableJobScheme(id);
};

facade.enableJobScheme = function(id) {
    return schemeRegister.enableJobScheme(id);
};

////GenerateJobs
facade.generateJobs = function(id, year, month) {
    return schemeRegister.generateJobs(id, year, month);
};

//Invoice
facade.getCurrentInvoices = function() {
    return invoiceRegister.getCurrentInvoices();
};

facade.getInvoice = function(invoiceId) {
    return invoiceRegister.getInvoice(invoiceId);
};

facade.invoicePaid = function(invoiceId) {
    return invoiceRegister.invoicePaid(invoiceId);
};

facade.invoiceInvoiced = function(invoiceId) {
    return invoiceRegister.invoiceInvoiced(invoiceId);
};

facade.createInvoice =  function(id, year, month){
    return invoiceRegister.invoiceGeneration(id, year, month);
};

facade.generateInvoice = function(invoiceId) {
    return invoiceRegister.generateInvoice(invoiceId);
};

facade.invoiceSearchOptions = function(searchParams, orderParams, page){
    return invoiceRegister.invoiceSearchOptions(searchParams, orderParams, page);
};

facade.deleteInvoice = function(invoiceId) {
    return invoiceRegister.deleteInvoice(invoiceId);
};

//Settings
facade.UpdateInvoiceTemplatePath = function(path) {
    return settingsRegister.UpdateInvoiceTemplatePath(path);
};

facade.UpdateInvoiceOutputPath = function(path){
    return settingsRegister.UpdateInvoiceOutputPath(path);
};

facade.UpdateBackupPath = function(path) {
    return settingsRegister.UpdateBackupPath(path);
};

facade.UpdateGSTPercentage = function(gst){
    return settingsRegister.UpdateGSTPercentage(gst);
};


module.exports = function getFacade() {
    var clients = require('../Registers/ClientRegister.js')().then(function(data) {
        clientRegister = data;
    });

    var jobs = require('../Registers/JobRegister.js')().then(function(data) {
        jobRegister = data;
    });

    var schemes = require('../Registers/JobSchemeRegister.js')().then(function(data) {
        schemeRegister = data;
    });

    var invoices = require('../Registers/InvoiceRegister.js')().then(function(data) {
        invoiceRegister = data;
    });

    settingsRegister = require('../Registers/SettingsRegister.js')();

    return Promise.all([clients, jobs, schemes, invoices]).then(function(data){
        return facade;
    });
};
