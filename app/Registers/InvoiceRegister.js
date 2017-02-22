var orm = require('../scripts/orm.js');

var register = {};

register.createInvoice = function(year, month, clientId) {
    getJobs(year, month, clientId).then(function(jobs) {
        console.log(jobs);
        var sum = 0;
        jobs.forEach(function(job) {
            sum += job.payment + job.gst;
        });

        orm.client.findById(clientId).then(function(client) {
            client.addNewInvoice(year, month, sum, jobs).then(function(data){
                updateJobs(jobs, data.id);
            });
        });
    });
};

//TODO: make a new function that includes the state of the job
//NOTE: Maybe add a generator
function getJobs(year, month, clientId) {
    var jobRegister = require('./JobRegister.js');
    var date = new Date.today().set({year: year, month: month-1, day: 1});
    return jobRegister.getMonthJobs(clientId, date);
}

function updateJobs(jobs, invoiceId) {
    var jobRegister = require('./JobRegister.js');
    var idList = [];
    jobs.forEach(function(job){
        idList.push(job.id);
    });
    console.log(idList);
    jobRegister.jobListInvoiced(idList, invoiceId);

}

register.getInvoice = function(id){
    orm.invoice.findById(id,{
        include:[orm.job]
    }).then(function(data){
        console.log(data.get({plain:true}));
    });
};

module.exports = register;
