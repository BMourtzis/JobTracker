var orm = require('../scripts/orm.js');

var register = {};

//Search Functions
////Simple Search
register.getJobScheme = function(id) {
    return orm.jobScheme.findById(id).then(function(query) {
        var data = query.get({
            plain: true
        });

        data.repetitionValues = JSON.parse(data.repetitionValues);
        data.repetitionValues.forEach(jobSchemeEditHelper);
        return data;
    });
};

register.getActiveJobSchemes = function() {
    var searchParams = { "enabled": true };
    return findJobSchemes(searchParams, "", 0);
};

register.searchJobSchemes = function(searchParams, page) {
    return findJobSchemes(generateQuery(searchParams), "", page);
};

//Query Generator Helper
function generateQuery(searchParams) {
    var query = {};

    searchParams.client = parseInt(searchParams.client);

    if(searchParams.enabled === "true") {
        searchParams.enabled = true;
    }
    else if(searchParams.enabled === "false") {
        searchParams.enabled = false;
    }
    else {
        searchParams.enabled = "";
    }

    if(searchParams.repetition !== "" && searchParams.repetition !== undefined) {
        query.repetition = searchParams.repetition;
    }

    if(searchParams.enabled !== "" && searchParams.enabled !== undefined) {
        query.enabled = searchParams.enabled;
    }

    if(!Number.isNaN(searchParams.client) && searchParams.client !== undefined && searchParams.client !== "") {
        query.clientId = searchParams.client;
    }

    return query;
}

function findJobSchemes(searchParams, orderParams, page) {
    if(!Number.isInteger(page)) {
        page = 0;
    }

    return orm.jobScheme.findAll({
        include: [orm.client],
        where: searchParams,
        order: orderParams,
        offset: page*100,
        limit: 100
    }).then(function(query) {
        return getPageCount(searchParams).then(function(count) {
            var schemes = [];
            for(var i = 0; i<query.length; i++) {
                schemes.push(query[i].get({plain:true}));
            }

            var data = {
                count: count,
                schemes: schemes
            };
            return data;
        });
    });
}

function getPageCount(searchParams) {
    return getCount(searchParams).then(function(count){
        return Math.floor(count/100);
    });
}

function getCount(searchParams){
    return orm.jobScheme.count({
        where: searchParams
    });
}

function getTotalSum(searchParams){
    return orm.jobScheme.sum('payment',{
        where: searchParams
    });
}

register.getJobSchemeCount = function(clientId) {
    return getCount(generateQuery({client: clientId}));
};

register.getActiveJobSchemeCount = function(clientId) {
    return getCount(generateQuery({client: clientId, enabled: true}));
};

register.getActiveJobSchemeSum = function(clientId) {
    return getTotalSum(generateQuery({client: clientId, enabled: true}));
};

function jobSchemeEditHelper(data) {
    if (data.day) {
        data.week = Math.floor(data.day/7);
        data.day %= 7;
    }

    if (data.hour < 10 && data.hour > -1) {
        data.hour = "0" + data.hour;
    }

    if (data.minute < 10 && data.minute > -1) {
        data.minute = "0" + data.minute;
    }
}

////Gets the specifed jobScheme and includes the client
register.getJobSchemeFull = function(id) {
    return orm.jobScheme.findById(id, {
        include: [orm.client]
    }).then(function(query) {
        var data = query.get({
            plain: true
        });

        data.repetitionValues = JSON.parse(data.repetitionValues);
        data.repetitionValues.forEach(jobSchemeHelper);
        return data;
    });
};

function jobSchemeHelper(data) {
        data.week = Math.floor(data.day/7);
        data.day %= 7;

        switch (data.day) {
            case 0:
                data.day = "Sunday";
                break;
            case 1:
                data.day = "Monday";
                break;
            case 2:
                data.day = "Tuesday";
                break;
            case 3:
                data.day = "Wednesday";
                break;
            case 4:
                data.day = "Thurday";
                break;
            case 5:
                data.day = "Friday";
                break;
            case 6:
                data.day = "Saturday";
                break;
        }

    if (data.hour < 10 && data.hour > -1) {
        data.hour = "0" + data.hour;
    }

    if (data.minute < 10 && data.minute > -1) {
        data.minute = "0" + data.minute;
    }
}

////Advanced Search
// register.findJobSchemes = function(searchParams) {
//   return orm.JobScheme.findAll({
//     where: searchParams
//   });
// }

//Create Functions
register.createJobScheme = function(jobname, payment, repeatition, repeatitionvalues, clientid) {
    return orm.client.findById(clientid).then(function(client) {
        return client.addNewJobScheme(jobname, payment, repeatition, repeatitionvalues);
    });
};

//Edit Function
register.editJobScheme = function(id, data) {
    return orm.jobScheme.findById(id).then(function(js) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].value !== "") {
                js[data[i].name] = data[i].value;
            }
        }
        return js.save();
    });
};

register.disableJobScheme = function(id) {
    return register.editJobScheme(id, [{name: "enabled", value: false}]);
};

register.enableJobScheme = function(id) {
    return register.editJobScheme(id, [{name: "enabled", value: true}]);
};

//GenerateJobs
register.generateJobs = function(id, year, month) {
    return orm.jobScheme.findById(id).then(function(jobScheme) {
        return jobScheme.generateJobs(year, month);
    });
};

register.generateClientJobs = function(clientId, year, month) {
    year = parseInt(year);
    month = parseInt(month)-1;
    if(clientId === "") {
        return GenerateAllActiveJobs(year, month);
    }
    else {
        clientId = parseInt(clientId);
        return GenerateClientActiveJobs(clientId, year, month);
    }
};

function GenerateAllActiveJobs(year, month) {
    return orm.jobScheme.findAll({
        where: {
            enabled: true
        }
    }).then(function(data){
        return generateMultipleJobs(data, year, month);
    });
}

function GenerateClientActiveJobs(clientId, year, month) {
    return orm.jobScheme.findAll({
        where: {
            enabled: true,
            clientId: clientId
        }
    }).then(function(data){
        return generateMultipleJobs(data, year, month);
    });
}

function generateMultipleJobs(data, year, month) {
    return Promise.resolve(0).then(function loop(i){
        if(i < data.length){
            return generateMultipleJobsHelper(data[i], year, month).then(function(){
                i++;
                return loop(i);
            });
        }
    });
}

function generateMultipleJobsHelper(scheme, year, month) {
    return new Promise(function(resolve){
        return scheme.generateJobs(year, month).then(function() {
            resolve();
        });
    });
}

//Delete jobScheme
register.removeJobScheme = function(id) {
    return orm.jobScheme.findById(id).then(function(jobScheme){
        return jobScheme.destroy();
    });
};

module.exports = function getRegister(){
    return require('../scripts/orm.js')().then(function(data){
        orm = data;
        return register;
    });
};
