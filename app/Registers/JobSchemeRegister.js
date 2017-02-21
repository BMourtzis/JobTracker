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
register.generateJobs = function(id, month) {
    return orm.jobScheme.findById(id).then(function(jobScheme) {
        jobScheme.generateJobs(month);
    });
};

module.exports = register;
