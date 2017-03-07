var orm = require('../scripts/orm.js');

var register = {};

//Client Functions
////Get all Clients
register.getAllClients = function() {
    return orm.client.findAll({
        order: "businessName ASC"
    }).then(function(query) {
        var data =  [];
        for (var i = 0; i < query.length; i++) {
            data.push(query[i].get({plain:true}));
        }
        return data;
    });
};

//Search Functions
////Simple Search
register.getClient = function(id){
    return orm.client.findById(id).then(function(query){
        return query.get({plain:true});
    });
};

//HACK: I have to limit and sort jobs after the query.
////Gets the specfied client and includes the Jobs and JobSchemes, Limits the jobs to 10
register.getClientFull = function(id) {
    return orm.client.findById(id,{include: [orm.job, orm.jobScheme]}).then(function(query){
        return query.get({plain:true});
    }).then(function(data){

        //Sorts the jobs by time
        data.jobs.sort(function(a,b){
            return b.timeBooked - a.timeBooked;
        });

        //Limits the jobs to the first 10
        data.jobs = data.jobs.slice(0,9);

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
register.createClient = function(firstname, lastname, businessname, shortname, address, email, phone) {
    return orm.client.create({
        firstName: firstname,
        lastName: lastname,
        businessName: businessname,
        shortName: shortname,
        address: address,
        email: email,
        phone: phone,
     });
};

////Edit Function
register.editClient = function(id, data){
    return orm.client.findById(id).then(function(query){
        for (var i = 0; i < data.length; i++) {
            if(data[i].value !== "")
            {
                query[data[i].name] = data[i].value;
            }
        }

        return query.save();
    });
};

register.removeClient = function(id) {
    return orm.client.findById(id).then(function(client){
        return client.destroy();
    });
};

module.exports = function getRegister(){
    return require('../scripts/orm.js')().then(function(data){
        orm = data;
        return register;
    });
};
