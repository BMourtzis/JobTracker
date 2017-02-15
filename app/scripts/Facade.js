var facade = { };

var orm = require("./orm.js");

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
    return orm.Job.findAll({include: [ orm.Client ] }).then(function(query){
        var jobs = [];
        for (var i = 0; i < query.length; i++) {
            jobs.push(query[i].get({plain:true}));
        }
        return jobs;
    }).then(function(data){
        data.sort(function(a,b){
            return b.timeBooked - a.timeBooked;
        });
        return data;
    });
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

facade.getTodaysJobs = function()
{
    var todayStart = new Date.today();
    var todayEnd = new Date.today().at({hour: 23, minute: 59});
    return orm.Job.findAll({
        include:[orm.Client],
        where:{
            timeBooked:{
                gt: todayStart,
                lt: todayEnd
            }
        }
    }).then(function(data){
        data.sort(function(a,b){
            return a.timeBooked - b.timeBooked;
        });
        return data;
    });
};

// facade.FindJobs = function(searchParams) {
//   return orm.Job.findAll({
//     where: searchParams
//   });
// }

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

facade.Done = function(id){
    var formData = [];

    formData.push({
        name: "state",
        value: "Done"
    });
    return facade.editJob(id, formData);
};

facade.Undone = function(id){
    var formData = [];

    formData.push({
        name: "state",
        value: "Placed"
    });
    return facade.editJob(id, formData);
};

////Remove Functions
facade.removeJob = function(id){
    return orm.Job.findById(id).then(function(job){
        return job.destroy();
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

module.exports = facade;
