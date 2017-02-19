var clientRegister = require('../Registers/ClientRegister.js');
var jobRegister = require('../Registers/JobRegister.js');
var schemeRegister = require('../Registers/JobSchemeRegister.js');

var facade = { };

// TODO: Remove invoice and paid functionality from jobs. Invoices will do that. Invoices will change the state to invoiced or paid accordingly.
//

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

facade.getJobFull = function(id){
    return jobRegister.getJobFull(id);
};

//////Advanced Search
facade.getDayJobs = function(from) {
    return jobRegister.getDayJobs(from);
};

facade.getClientJobs = function(searchParams, orderParams, page){
    return jobRegister.getClientJobs(searchParams, orderParams, page);
};

facade.getMonthJobs = function(clientId, year, month){
    return jobRegister.getMonthJobs(clientId, year, month);
};

facade.searchJobs = function(searchParams, orderParams, page) {
    return jobRegister.searchJobs(searchParams, orderParams, page);
};

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

//////State Machine for single objects
facade.done = function(id){
    return jobRegister.done(id);
};

facade.undone = function(id){
    return jobRegister.undone(id);
};

//TODO: Maybe I won't need these
facade.invoice = function(id) {
    return jobRegister.invoice(id);
};

facade.uninvoice = function(id){
    return jobRegister.uninvoice(id);
};

facade.paid = function(id){
    return jobRegister.paid(id);
};

facade.unpaid = function(id){
    return jobRegister.unpaid(id);
};

//List State Machine
facade.jobListDone = function(idList) {
    return jobRegister.jobListDone(idList);
};

facade.jobListInvoiced = function(idList) {
    return jobRegister.jobListInvoiced(idList);
};

facade.jobListPaid = function(idList) {
    return jobRegister.jobListPaid(idList);
};

////Remove Functions
facade.removeJob = function(id){
    return jobRegister.removeJob(id);
};

facade.bulkDeleteJobs = function(idList) {
    return jobRegister.bulkDeleteJobs(idList);
};



//JobScheme Functions
////Search Functions
//////Simple Search
facade.getJobScheme = function(id) {
    return schemeRegister.getJobScheme(id);
};

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

////GenerateJobs
facade.generateJobs = function(id, month) {
    return schemeRegister.generateJobs(id, month);
};


//TODO: Move these to another file
//Invoice
// facade.generateMonthInvoices = function(year, month){
//     var from = new Date.today().set({year: year, month: month, day: 1});
//     var to = new Date(from).set({day:from.getDaysInMonth(), hour: 23, minute: 59});
//
//     return orm.Client.findAll({
//         include:[{
//             model: orm.Job,
//             where: {
//                 state: "Done",
//                 timeBooked: {
//                     gt:from,
//                     lt: to
//                 }
//             }
//         }]
//     }).then(function(data){
//         if(data.length > 0) {
//             var clients = [];
//             for(var i = 0; i < data.length; i++)
//             {
//                 clients.push(data[i].get({plain: true}));
//             }
//             return clients;
//         }
//         return data;
//     }).then(function(data){
//         if(data){
//             RG.generateMultipleInvoices(data, year, month);
//         }
//
//     });
// };
//
// facade.generateClientInvoice = function(client, year, month){
//     var from = new Date.today().set({year: year, month: month, day: 1});
//     var to = new Date(from).set({day:from.getDaysInMonth(), hour: 23, minute: 59});
//
//     return orm.Client.findOne({
//         include:[{
//             model: orm.Job,
//             where: {
//                 state: "Done",
//                 timeBooked: {
//                     gt:from,
//                     lt: to
//                 },
//             }
//         }],
//         where: {
//             id: client
//         }
//     }).then(function(data){
//         if(data) {
//             return data.get({plain: true});
//         }
//         return data;
//     }).then(function(data){
//         if(data){
//             RG.generateInvoice(data, year, month);
//         }
//
//     });
//
// };

module.exports = facade;
