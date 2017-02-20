var orm = require('../scripts/orm.js');

var register = {};

//Search Functions
////Simple Search
register.getJobScheme = function(id) {
    return orm.jobScheme.findById(id).then(function(query){
        return query.get({plain: true});
    });
};

////Gets the specifed jobScheme and includes the client
register.getJobSchemeFull = function(id){
    return orm.jobScheme.findById(id, {include: [orm.client]}).then(function(query) {
        return query.get({plain: true});
    });
};

////Advanced Search
// register.findJobSchemes = function(searchParams) {
//   return orm.JobScheme.findAll({
//     where: searchParams
//   });
// }

//Create Functions
register.createJobScheme = function(jobname, payment, repeatition, repeatitionvalues, clientid) {
    return orm.client.findById(clientid).then(function(client){
        return client.addNewJobScheme(jobname, payment, repeatition, repeatitionvalues);
    });
};

//Edit Function
register.editJobScheme = function(id, data){
    return orm.jobScheme.findById(id).then(function(js){
        for (var i = 0; i < data.length; i++) {
            if(data[i].value !== "")
            {
                js[data[i].name] = data[i].value;
            }
        }
        return js.save();
    });
};

//GenerateJobs
register.generateJobs = function(id, month) {
    return orm.jobScheme.findById(id).then(function(jobScheme){
        jobScheme.generateJobs(month);
    });
};

module.exports = register;
