var facade = { };

var orm = require("./orm.js");

//Client Functions
////Get all Clients
facade.getAllClients = async(function() {
    return await(orm.Client.findAll().then(function(query) {
        var clients =  [];
        for (var i = 0; i < query.length; i++) {
            clients.push(query[i].get({plain:true}));
        }
        return clients;
    }));
});

////Search Functions
//////Simple Search
facade.getClient = async(function(id){
    return await(orm.Client.findById(id).then(function(query){
        return query.get({plain:true});
    }));
});

facade.getClientFull = async(function(id) {
    return await(orm.Client.findById(id,{include: [orm.Job, orm.JobScheme]}).then(function(query){
        return query.get({plain:true});
    }));
});

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
facade.editClient = async(function(id, data){
    return await(orm.Client.findById(id).then(function(client){
        for (var i = 0; i < data.length; i++) {
            if(data[i].value !== "")
            {
                client[data[i].name] = data[i].value;
            }
        }

        return client.save();
    }));
});

//Job Functions
////Get all Clients
facade.getAllJobs = async(function(){
    return await(orm.Job.findAll({include: [ orm.Client ] }).then(function(query){
        var jobs = [];
        for (var i = 0; i < query.length; i++) {
            jobs.push(query[i].get({plain:true}));
        }
        return jobs;
    }));
});

////Search Functions
//////Simple Search
facade.getJob =  async(function(id) {
    return await(orm.Job.findById(id).then(function(query){
        return query.get({plain:true});
    }));
});

facade.getJobFull = async(function(id){
    return await(orm.Job.findById(id,{include: [orm.Client]}).then(function(query) {
        return query.get({plain:true});
    }));
});

//////Advanced Search
// facade.FindJobs = function(searchParams) {
//   return orm.Job.findAll({
//     where: searchParams
//   });
// }

////Create Functions
facade.createJob = async(function(jobname, timebooked, payment, clientid) {
    return await (orm.Client.findById(clientid).then(function(client) {
         return client.addNewJob(jobname, timebooked, payment);
    }));
});

////Edit Function
facade.editJob = async(function(id, data){
    console.log(data);
    return await(orm.Job.findById(id).then(function(job){
        for (var i = 0; i < data.length; i++) {
            if(data[i].value !== "")
            {
                job[data[i].name] = data[i].value;
            }
        }
        console.log(job.get({plain:true}));
        return job.save();
    }));
});

////Remove Functions
facade.removeJob = async(function(id){
    return await(orm.Job.findById(id).then(function(job){
        return job.destroy();
    }));
});

//JobScheme Functions
////Search Functions
//////Simple Search
facade.getJobScheme = async(function(id) {
    return await(orm.JobScheme.findById(id).then(function(query){
        return query.get({plain: true});
    }));
});

facade.getJobSchemeFull = async(function(id){
    return await(orm.JobScheme.findById(id, {include: [orm.Client]}).then(function(query) {
        return query.get({plain: true});
    }));
});

//////Advanced Search
// facade.findJobSchemes = function(searchParams) {
//   return orm.JobScheme.findAll({
//     where: searchParams
//   });
// }

////Create Functions
facade.createJobScheme = async(function(jobname, payment, repeatition, repeatitionvalues, clientid) {
    return await(orm.Client.findById(clientid).then(function(client){
        return client.addNewJobScheme(jobname, payment, repeatition, repeatitionvalues);
    }));
});

////GenerateJobs
facade.generateJobs = async(function(id) {
    return await(orm.JobScheme.findById(id).then(function(jobScheme){
        jobScheme.generateJobs();
    }));
});

module.exports = facade;
