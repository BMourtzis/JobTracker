var facade = { };

var orm = require("./orm.js");

// TODO: Remove invoice and paid functionality from jobs. Invoices will do that. Invoices will change the state to invoiced or paid accordingly.
//

//Client Functions
////Get all Clients
facade.getAllClients = function() {
    return orm.Client.findAll().then(function(query) {
        var clients =  [];
        for (var i = 0; i < query.length; i++) {
            clients.push(query[i].get({plain:true}));
        }
        return clients;
    });
};

////Search Functions
//////Simple Search
facade.getClient = function(id){
    return orm.Client.findById(id).then(function(query){
        return query.get({plain:true});
    });
};

facade.getClientFull = function(id) {
    return orm.Client.findById(id,{include: [orm.Job, orm.JobScheme]}).then(function(query){
        return query.get({plain:true});
    }).then(function(data){
        data.jobs.sort(function(a,b){
            return b.timeBooked - a.timeBooked;
        });
        return data;
    });
};

//////Advanced Search
// facade.findClients = function(searchParams) {
//   return orm.Client.findAll({
//     where: searchParams
//   });
// }

////Create Functions
facade.createClient = function(firstname, lastname, businessname, shortname, address, email, phone) {
  orm.Client.create({
    firstName: firstname,
    lastName: lastname,
    businessName: businessname,
    shortName: shortname,
    Address: address,
    Email: email,
    Phone: phone,
  });
};

////Edit Function
facade.editClient = function(id, data){
    return orm.Client.findById(id).then(function(client){
        for (var i = 0; i < data.length; i++) {
            if(data[i].value !== "")
            {
                client[data[i].name] = data[i].value;
            }
        }

        return client.save();
    });
};

//Job Functions
////Get all Clients
facade.getAllJobs = function(){
    var searchParams = {
        from: Date.today().last().year().set({month: 0, day: 1}),
        to: Date.today().set({month: 11, day: 31}).at({hour: 23, minute: 59})
    };

    return facade.FindJobs(facade.generateQuery(searchParams), {}, 0);
};

////Search Functions
//////Simple Search
facade.getJob =  function(id) {
    return orm.Job.findById(id).then(function(query){
        return query.get({plain:true});
    });
};

facade.getJobFull = function(id){
    return orm.Job.findById(id,{include: [orm.Client]}).then(function(query) {
        return query.get({plain:true});
    });
};

//////Advanced Search
facade.getDayJobs = function(from)
{
    var searchParams = {
        from: from,
        to: new Date(from).at({hour: 23, minute: 59})
    };

    return facade.FindJobs(facade.generateQuery(searchParams), {}, 0);
};

//TODO: check if page is a number
//TODO: update to findAncCountAll method
facade.FindJobs = function(searchParams, orderParams, page) {
    // if(!Number.isNumeric(page)){ page = 0; }
    return orm.Job.findAll({
        include:[orm.Client],
        where: searchParams,
        order: 'timeBooked DESC',
        offset: page*100,
        limit: 100
    }).then(function(query){
        return facade.getJobPageCount(searchParams).then(function(count){
            var jobs = [];
            for (var i = 0; i < query.length; i++) {
                jobs.push(query[i].get({plain:true}));
            }

            var data = {
                count: count,
                jobs: jobs
            };

            return data;
        });
    });
};

facade.getMonthJobs = function(clientId, year, month){
    var from = new Date.today().set({year: year, month: month, day: 1});
    var to = new Date(from).set({day:from.getDaysInMonth(), hour: 23, minute: 59});

    return orm.Job.findAll({
        where:{
            clientID: clientId,
            timeBooked:{
                gt: from,
                lt: to
            }
        }
    }).then(function(data){
        if(data){
            var jobs = [];
            for(var i = 0; i< data.length; i++){
                jobs.push(data[i].get({plain: true}));
            }

            return jobs;
        }
        return data;
    });
};

facade.searchJobs = function(searchParams, orderParams, page) {
    var where = facade.generateQuery(searchParams);
    return facade.FindJobs(where, orderParams, page);
};

facade.getJobPageCount = function(searchParams){
    return orm.Job.count({
        where: searchParams
    }).then(function (count) {
        return Math.floor(count/100);
    });
};

//Query Generator Helper
facade.generateQuery = function(searchParams) {
    var query = {};

    if(searchParams.from !== undefined && searchParams.to !== undefined){
        if(searchParams.from === undefined){
            query.timeBooked = {
                lt: searchParams.to
            };
        }
        else if(searchParams.to === undefined){
            query.timeBooked = {
                gt: searchParams.from
            };
        }
        else{
            query.timeBooked = {
                gt: searchParams.from,
                lt: searchParams.to
            };
        }
    }

    if(searchParams.statusSelect !== "" && searchParams.statusSelect !== undefined){
        query.state = searchParams.statusSelect;
    }

    if(!Number.isNaN(searchParams.clientSelect) && searchParams.clientSelect !== undefined){
        query.clientID = searchParams.clientSelect;
    }

    return query;
};

////Create Functions
facade.createJob = function(jobname, timebooked, payment, clientid) {
    return orm.Client.findById(clientid).then(function(client) {
         return client.addNewJob(jobname, timebooked, payment);
    });
};

////Edit Function
facade.editJob = function(id, data){
    return orm.Job.findById(id).then(function(job){
        for (var i = 0; i < data.length; i++) {
            if(data[i].value !== "")
            {
                job[data[i].name] = data[i].value;
            }
        }
        return job.save();
    });
};

//////State Machine for single objects
facade.done = function(id){
    var formData = [];

    formData.push({
        name: "state",
        value: "Done"
    });
    return facade.editJob(id, formData);
};

facade.undone = function(id){
    var formData = [];

    formData.push({
        name: "state",
        value: "Placed"
    });
    return facade.editJob(id, formData);
};

facade.invoice = function(id) {
    var formData = [];

    formData.push({
        name: "state",
        value: "Invoiced"
    });
    return facade.editJob(id, formData);
};

facade.uninvoice = function(id){
    var formData = [];

    formData.push({
        name: "state",
        value: "Done"
    });
    return facade.editJob(id, formData);
};

facade.paid = function(id){
    var formData = [];

    formData.push({
        name: "state",
        value: "Paid"
    });
    return facade.editJob(id, formData);
};

facade.unpaid = function(id){
    var formData = [];

    formData.push({
        name: "state",
        value: "Invoiced"
    });
    return facade.editJob(id, formData);
};

//List State Machine
facade.bulkUpdateJobList = function(idList, state){
    var query = {
        id: {$in: idList}
    };
    return orm.Job.update({state: state}, {where: query});
};

facade.jobListDone = function(idList) {
    return facade.bulkUpdateJobList(idList, "Done");
};

facade.jobListInvoiced = function(idList) {
    return facade.bulkUpdateJobList(idList, "Invoiced");
};

facade.jobListPaid = function(idList) {
    return facade.bulkUpdateJobList(idList, "Paid");
};

////Remove Functions
facade.removeJob = function(id){
    return orm.Job.findById(id).then(function(job){
        return job.destroy();
    });
};

facade.bulkDeleteJobs = function(idList) {
    return orm.Job.destroy({
        where: {id:{$in: idList}}
    });
};



//JobScheme Functions
////Search Functions
//////Simple Search
facade.getJobScheme = function(id) {
    return orm.JobScheme.findById(id).then(function(query){
        return query.get({plain: true});
    });
};

facade.getJobSchemeFull = function(id){
    return orm.JobScheme.findById(id, {include: [orm.Client]}).then(function(query) {
        return query.get({plain: true});
    });
};

//////Advanced Search
// facade.findJobSchemes = function(searchParams) {
//   return orm.JobScheme.findAll({
//     where: searchParams
//   });
// }

////Create Functions
facade.createJobScheme = function(jobname, payment, repeatition, repeatitionvalues, clientid) {
    return orm.Client.findById(clientid).then(function(client){
        return client.addNewJobScheme(jobname, payment, repeatition, repeatitionvalues);
    });
};

////Edit Function
facade.editJobScheme = function(id, data){
    return orm.JobScheme.findById(id).then(function(js){
        for (var i = 0; i < data.length; i++) {
            if(data[i].value !== "")
            {
                js[data[i].name] = data[i].value;
            }
        }
        return js.save();
    });
};

////GenerateJobs
facade.generateJobs = function(id, month) {
    return orm.JobScheme.findById(id).then(function(jobScheme){
        jobScheme.generateJobs(month);
    });
};

//Invoice
facade.generateMonthInvoices = function(year, month){
    var from = new Date.today().set({year: year, month: month, day: 1});
    var to = new Date(from).set({day:from.getDaysInMonth(), hour: 23, minute: 59});

    return orm.Client.findAll({
        include:[{
            model: orm.Job,
            where: {
                state: "Done",
                timeBooked: {
                    gt:from,
                    lt: to
                }
            }
        }]
    }).then(function(data){
        if(data.length > 0) {
            var clients = [];
            for(var i = 0; i < data.length; i++)
            {
                clients.push(data[i].get({plain: true}));
            }
            return clients;
        }
        return data;
    }).then(function(data){
        if(data){
            RG.generateMultipleInvoices(data, year, month);
        }

    });
};

facade.generateClientInvoice = function(client, year, month){
    var from = new Date.today().set({year: year, month: month, day: 1});
    var to = new Date(from).set({day:from.getDaysInMonth(), hour: 23, minute: 59});

    return orm.Client.findOne({
        include:[{
            model: orm.Job,
            where: {
                state: "Done",
                timeBooked: {
                    gt:from,
                    lt: to
                },
            }
        }],
        where: {
            id: client
        }
    }).then(function(data){
        if(data) {
            return data.get({plain: true});
        }
        return data;
    }).then(function(data){
        if(data){
            RG.generateInvoice(data, year, month);
        }

    });

};

module.exports = facade;
