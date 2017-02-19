var orm = require('../scripts/orm.js');

var register = {};

//Client Functions
////Get all Clients
register.getAllClients = function() {
    return orm.client.findAll().then(function(query) {
        var data =  [];
        for (var i = 0; i < query.length; i++) {
            data.push(query[i].get({plain:true}));
        }
        return data;
    });
};

////Search Functions
//////Simple Search
register.getClient = function(id){
    return orm.client.findById(id).then(function(query){
        return query.get({plain:true});
    });
};

//TODO: Use query sorting
//TODO: Fix the orm.Job and orm.JobScheme issue
register.getClientFull = function(id) {
    return orm.client.findById(id,{include: [orm.job, orm.jobScheme]}).then(function(query){
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
register.createClient = function(firstname, lastname, businessname, shortname, address, email, phone) {
  orm.client.create({
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

module.exports = register;
