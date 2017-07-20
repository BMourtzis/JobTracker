var orm;

var register = {};

/**
 * register.getJobScheme - Fetches the job scheme specified
 *
 * @param  {Number} id The id of the jobScheme
 * @return {Promise}   A promise with the jobScheme
 */
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

register.getClientJobScheme = function(clientId) {
    return orm.jobScheme.findAll({
        where: generateQuery({ client: clientId })
    }).then(function(query) {
        var schemes = [];

        for (var i = 0; i < query.length; i++) {
            schemes.push(query[i].get({
                plain: true
            }));
        }
        return schemes;
    });
}

/**
 * register.getActiveJobSchemes - Fetches all active jobSchemes
 *
 * @return {Promis}  A promise with all the active (enabled) jobSchemes
 */
register.getActiveJobSchemes = function() {
    var searchParams = {
        "enabled": true
    };
    return findJobSchemes(searchParams, "", 0);
};

/**
 * register.searchJobSchemes - Searches for jobSchemes with the given search parameters
 *
 * @param  {Object} searchParams An object with the search parameters
 * @param  {Number} page         The page of the list needed
 * @return {Promise}             A promise with a list of jobSchemes
 */
register.searchJobSchemes = function(searchParams, page) {
    return findJobSchemes(generateQuery(searchParams), "", page);
};

/**
 * register.getJobSchemeCount - Gets the count of jobSchemes for a client specified
 *
 * @param  {Number} clientId The id of the client
 * @return {Promise}         A promise with the count
 */
register.getJobSchemeCount = function(clientId) {
    return getCount(generateQuery({
        client: clientId
    }));
};

/**
 * register.getActiveJobSchemeCount - Gets the count of all the active (enabled) jobSchemes for the client specified
 *
 * @param  {Number} clientId The id of the client
 * @return {Promise}         A promise with the count
 */
register.getActiveJobSchemeCount = function(clientId) {
    return getCount(generateQuery({
        client: clientId,
        enabled: true
    }));
};

/**
 * register.getActiveJobSchemeSum - Gets the sum of all the active (enabled) jobSchemes for the client specified
 *
 * @param  {Number} clientId The id of the client
 * @return {Promise}         A promise with the sum
 */
register.getActiveJobSchemeSum = function(clientId) {
    return getTotalSum(generateQuery({
        client: clientId,
        enabled: true
    }));
};

/**
 * register.getJobSchemeFull - Fetches a jobSchemes including the client that owns it
 *
 * @param  {Number} id The id of the jobScheme
 * @return {Promise}   A promise with the jobScheme
 */
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

/**
 * register.createJobScheme - Creates a new jobScheme
 *
 * @param  {Number} jobname           The name of the jobScheme
 * @param  {Number} payment           The payment of the jobScheme
 * @param  {String} repeatition       The repetition of the jobScheme
 * @param  {Object} repeatitionvalues The repeatitionvalues of the jobScheme
 * @param  {Number} clientid          The id of the client that owns it
 * @return {Promise}                  A promise with the newly created jobScheme
 */
register.createJobScheme = function(jobname, payment, repeatition, repeatitionvalues, clientid) {
    return orm.client.findById(clientid).then(function(client) {
        return client.addNewJobScheme(jobname, payment, repeatition, repeatitionvalues);
    });
};

/**
 * register.editJobScheme - Edits the details of a jobScheme
 *
 * @param  {Number} id   The id of the jobScheme
 * @param  {Object} data The details to be changed
 * @return {Promise}     A promise with the edited jobScheme
 */
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

/**
 * register.disableJobScheme - Disabled a jobScheme
 *
 * @param  {Number} id The id of the jobScheme
 * @return {Promise}   A promise with the disabled jobScheme
 */
register.disableJobScheme = function(id) {
    return register.editJobScheme(id, [{
        name: "enabled",
        value: false
    }]);
};

/**
 * register.enableJobScheme - Enables a jobScheme
 *
 * @param  {Number} id The id of the jobScheme
 * @return {Promise}   A promise the enabled jobScheme
 */
register.enableJobScheme = function(id) {
    return register.editJobScheme(id, [{
        name: "enabled",
        value: true
    }]);
};

/**
 * register.generateJobs - Generates jobs from the scheme and for the year and month given
 *
 * @param  {Number} id    The id of the jobScheme
 * @param  {Number} year  The year to be generated
 * @param  {Number} month The month to be generated
 * @return {Promise}      A promise with the generated job(s)
 */
register.generateJobs = function(id, year, month) {
    return orm.jobScheme.findById(id).then(function(jobScheme) {
        return jobScheme.generateJobs(year, month);
    });
};

/**
 * register.generateClientJobs - Generates jobs based on the schemes that belong to the client. If clientId is empty (""), it will loop throught all the clients
 *
 * @param  {Number} clientId The id of the client. If "", it will generate for all clients
 * @param  {Number} year     The year to be generated
 * @param  {Number} month    The month to be generated
 * @return {Promise}         A promise with the generated job(s)
 */
register.generateClientJobs = function(clientId, year, month) {
    year = parseInt(year);
    month = parseInt(month) - 1;
    if (clientId === "") {
        return GenerateAllActiveJobs(year, month);
    } else {
        clientId = parseInt(clientId);
        return GenerateClientActiveJobs(clientId, year, month);
    }
};

/**
 * register.removeJobScheme - It removes the specified jobScheme
 *
 * @param  {Number} id The id of the jobScheme
 * @return {Promise}   A promise with the deleted jobScheme
 */
register.removeJobScheme = function(id) {
    return orm.jobScheme.findById(id).then(function(jobScheme) {
        return jobScheme.destroy();
    });
};

/**
 * generateQuery - It geneates the search query
 *
 * @param  {Object} searchParams The search parameters that need to be searched
 * @return {Object}              The formatted query
 */
function generateQuery(searchParams) {
    var query = {};

    searchParams.client = parseInt(searchParams.client);

    if (searchParams.enabled === "true") {
        searchParams.enabled = true;
    } else if (searchParams.enabled === "false") {
        searchParams.enabled = false;
    } else {
        searchParams.enabled = "";
    }

    if (searchParams.repetition !== "" && searchParams.repetition !== undefined) {
        query.repetition = searchParams.repetition;
    }

    if (searchParams.enabled !== "" && searchParams.enabled !== undefined) {
        query.enabled = searchParams.enabled;
    }

    if (!Number.isNaN(searchParams.client) && searchParams.client !== undefined && searchParams.client !== "") {
        query.clientId = searchParams.client;
    }

    return query;
}

/**
 * findJobSchemes - It searches for jobSchemes with the given search parameters
 *
 * @param  {Object} searchParams The formatted search parameters
 * @param  {String} orderParams  The order parater
 * @param  {Number} page         The page of the list
 * @return {Promise}             A promise with a list of jobSchemes
 */
function findJobSchemes(searchParams, orderParams, page) {
    if (!Number.isInteger(page)) {
        page = 0;
    }

    return orm.jobScheme.findAll({
        include: [orm.client],
        where: searchParams,
        order: orderParams,
        offset: page * 100,
        limit: 100
    }).then(function(query) {
        return getPageCount(searchParams).then(function(count) {
            var schemes = [];
            for (var i = 0; i < query.length; i++) {
                schemes.push(query[i].get({
                    plain: true
                }));
            }

            var data = {
                count: count,
                schemes: schemes
            };
            return data;
        });
    });
}

/**
 * getPageCount - Gets the number of pages of a search
 *
 * @param  {Object} searchParams The formatted search parameters
 * @return {Promise}             A promise with the page count
 */
function getPageCount(searchParams) {
    return getCount(searchParams).then(function(count) {
        return Math.floor(count / 100);
    });
}

/**
 * getCount - Gets the count for a search
 *
 * @param  {Object} searchParams The formated search parameters
 * @return {Promise}             A promise with the count of the search
 */
function getCount(searchParams) {
    return orm.jobScheme.count({
        where: searchParams
    });
}

/**
 * getTotalSum - Sums the total for the search
 *
 * @param  {Object} searchParams The formatted search parameters
 * @return {Promise}             A promise with the sum of the search
 */
function getTotalSum(searchParams) {
    return orm.jobScheme.sum('payment', {
        where: searchParams
    });
}

/**
 * GenerateAllActiveJobs - Generates all the active jobScheme
 *
 * @param  {Number} year  The year to be generated
 * @param  {Number} month The month to be generated
 * @return {Promise}      A promise with all the generated job(s)
 */
function GenerateAllActiveJobs(year, month) {
    return orm.jobScheme.findAll({
        where: {
            enabled: true
        }
    }).then(function(data) {
        return generateMultipleJobs(data, year, month);
    });
}

/**
 * GenerateClientActiveJobs - Generates active jobSchemes for the specified client
 *
 * @param  {Number} clientId The id of the client
 * @param  {Number} year     The year to be generated
 * @param  {Number} month    The month to be generated
 * @return {Promise}         A promise with the generated job(s)
 */
function GenerateClientActiveJobs(clientId, year, month) {
    return orm.jobScheme.findAll({
        where: {
            enabled: true,
            clientId: clientId
        }
    }).then(function(data) {
        return generateMultipleJobs(data, year, month);
    });
}

/**
 * generateMultipleJobs - Generates multiple jobSchemes
 *
 * @param  {Object} data  The jobScheme list
 * @param  {Number} year  The year to be generated
 * @param  {Number} month The month to be generated
 * @return {Promise}      A promise with the generated job(s)
 */
function generateMultipleJobs(data, year, month) {
    return Promise.resolve(0).then(function loop(i) {
        if (i < data.length) {
            return generateMultipleJobsHelper(data[i], year, month).then(function() {
                i++;
                return loop(i);
            });
        }
    });
}

/**
 * generateMultipleJobsHelper - A helper function for chaining jobScheme generation
 *
 * @param  {Object(JobScheme)} scheme The jobScheme to be generated
 * @param  {Number} year              The year to be generated
 * @param  {Number} month             The month to be generated
 * @return {Promise}                  A promise with a list of jobSchemes
 */
function generateMultipleJobsHelper(scheme, year, month) {
    return new Promise(function(resolve) {
        return scheme.generateJobs(year, month).then(function() {
            resolve();
        });
    });
}

/**
 * jobSchemeHelper - Formats the jobScheme object to be make more readable
 *
 * @param  {Object(JobScheme)} data The jobScheme to be formatted
 */
function jobSchemeHelper(data) {
    data.week = Math.floor(data.day / 7);
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

// TODO: add these formatting functions closer to the controller if they can go

/**
 * jobSchemeEditHelper - Formats the jobScheme object to make it accessible to the edit page
 *
 * @param  {Object(JobScheme)} data The jobScheme to be formatted
 */
function jobSchemeEditHelper(data) {
    if (data.day) {
        data.week = Math.floor(data.day / 7);
        data.day %= 7;
    }

    if (data.hour < 10 && data.hour > -1) {
        data.hour = "0" + data.hour;
    }

    if (data.minute < 10 && data.minute > -1) {
        data.minute = "0" + data.minute;
    }
}

/**
 * initiateRegister - Initiatesthe JobScheme Register
 *
 * @return {Object}  Returns the initiated JobScheme Register
 */
function initiateRegister(injORM) {
    orm = injORM;
    return register;
}

module.exports = initiateRegister;
