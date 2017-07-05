var orm;

var register = {};

/**
 * register.getAllJobs - Fetches all jobs booked for the currentr and the previous year
 *
 * @return {Promise}  A promise with a list of jobs
 */
register.getAllJobs = function() {
    var searchParams = {
        from: Date.today().last().year().set({
            month: 0,
            day: 1
        }),
        to: Date.today().set({
            month: 11,
            day: 31
        }).at({
            hour: 23,
            minute: 59
        })
    };


    return register.FindJobs(generateQuery(searchParams), "timeBooked DESC", 0);
};

/**
 * register.getJob - Fetches a job
 *
 * @param  {Number} id The id of the job
 * @return {Promise}   A promise with a job
 */
register.getJob = function(id) {
    return orm.job.findById(id).then(function(query) {
        return query.get({
            plain: true
        });
    });
};

/**
 * register.getJobFull - Fetches a job and includes the client
 *
 * @param  {Number} id The id of the job
 * @return {Promise}   A Promise with a job
 */
register.getJobFull = function(id) {
    return orm.job.findById(id, {
        include: [orm.client]
    }).then(function(query) {
        return query.get({
            plain: true
        });
    });
};

// NOTE: what method or function uses that?

/**
 * register.getJobfromClient - Returns a client with one job
 *
 * @param  {Number} clientId The id of the client
 * @param  {Number} jobId    The id of the job
 * @return {Promise}         A promise with a client
 */
register.getJobfromClient = function(clientId, jobId) {
    return orm.client.findById(id, {
        include: [{
            model: orm.job,
            where: {
                id: jobId
            }
        }]
    }).then(function(data) {
        return data.get({
            plain: true
        });
    });
};

/**
 * register.getDayJobs - Fetches jobs booked on the day specified
 *
 * @param  {Date} from The day to search for jobs, should have a hour and minute of 0
 * @return {Promise}   A promise with a list of jobs
 */
register.getDayJobs = function(from) {
    var searchParams = {
        from: moment(from),
        to: moment(new Date(from).at({
            hour: 23,
            minute: 59
        }))
    };

    return register.FindJobs(generateQuery(searchParams), "timeBooked ASC", 0);
};

/**
 * register.FindJobs - Searches for jobs with the parameters given
 *
 * @param  {Object} searchParams An object with formatted search parameters
 * @param  {String} orderParams  A string of the ordering needed
 * @param  {Number} page         The page of the list
 * @return {Promise}             A promise with a list of jobs
 */
register.FindJobs = function(searchParams, orderParams, page) {
    if (!Number.isInteger(page)) {
        page = 0;
    }

    return orm.job.findAll({
        include: [orm.client, orm.invoice],
        where: searchParams,
        order: orderParams,
        offset: page * 100,
        limit: 100
    }).then(function(query) {
        return getJobPageCount(searchParams).then(function(count) {
            var jobs = [];
            for (var i = 0; i < query.length; i++) {
                jobs.push(query[i].get({
                    plain: true
                }));
            }

            var data = {
                count: count,
                jobs: jobs
            };

            return data;
        });
    });
};

/**
 * register.getClientJobs - description
 *
 * @param  {Object} searchParams An object with search parameters
 * @param  {String} orderParams  A string of the ordering needed
 * @param  {Number} page         The page of the list
 * @return {Promise}             A promise with a list of jobs
 */
register.getClientJobs = function(searchParams, orderParams, page) {
    if (orderParams === "") {
        orderParams = "timeBooked DESC";
    }

    return register.FindJobs(generateQuery(searchParams), orderParams, page);
};

/**
 * register.getMonthJobs - Returns jobs of a client for the month specified
 *
 * @param  {Number} clientId The id of the client
 * @param  {Date} date       The date with the month needed
 * @return {Promise}         A promise with a list of jobs
 */
register.getMonthJobs = function(clientId, date) {
    var from = new Date(date).set({
        day: 1
    });
    var to = new Date(from).set({
        day: from.getDaysInMonth(),
        hour: 23,
        minute: 59
    });

    return orm.job.findAll({
        where: {
            clientID: clientId,
            timeBooked: {
                gt: from,
                lt: to
            }
        }
    }).then(function(data) {
        if (data) {
            var jobs = [];
            for (var i = 0; i < data.length; i++) {
                jobs.push(data[i].get({
                    plain: true
                }));
            }

            return jobs;
        }
        return data;
    });
};

/**
 * register.getMonthJobs - Returns jobs for the month specified
 *
 * @param  {Date} date       The date with the month needed
 * @return {Promise}         A promise with a list of jobs
 */
register.getJobsForMonth = function(date) {
    var from = new Date(date).set({
        day: 1
    });

    from.prev().month();
    var to = new Date(from).set({
        day: from.getDaysInMonth(),
        hour: 23,
        minute: 59
    });
    to.next().month();

    return orm.job.findAll({
        include: [orm.client],
        where: {
            timeBooked: {
                gt: from,
                lt: to
            }
        }
    }).then(function(data) {
        if (data) {
            var jobs = [];
            for (var i = 0; i < data.length; i++) {
                jobs.push(data[i].get({
                    plain: true
                }));
            }

            return jobs;
        }
        return data;
    });
};

/**
 * register.searchJobs - Searches for jobs with the parameters given
 *
 * @param  {Object} searchParams An object with search Parameters
 * @param  {String} orderParams  A string with the ordering wanted
 * @param  {Number} page         The page of the list
 * @return {Promise}             A promise with a list of jobs
 */
register.searchJobs = function(searchParams, orderParams, page) {
    if (orderParams === "") {
        orderParams = "timeBooked DESC";
    }

    return register.FindJobs(generateQuery(searchParams), orderParams, page);
};

/**
 * register.getJobCount - Gets the count of the jobs that belong to a client
 *
 * @param  {Number} clientId The id of the client
 * @return {Promise}         A promise with the count
 */
register.getJobCount = function(clientId) {
    return getCount(generateQuery({
        clientID: clientId
    }));
};

/**
 * register.getPendingJobCount - Gets the count of pending (Placed) jobs that belong to a client
 *
 * @param  {Number} clientId The id of the client
 * @return {Promise}         A promise with the count
 */
register.getPendingJobCount = function(clientId) {
    return getCount(generateQuery({
        clientID: clientId,
        state: "Placed"
    }));
};

/**
 * register.createJob - Creates a new job with the parameters given
 *
 * @param  {String} jobname    The name of the job
 * @param  {Date}   timebooked The time the job is booked
 * @param  {Number} payment    How much the job costs
 * @param  {Number} clientid   The id of the client
 * @return {Promise}           A promise with the newly created job
 */
register.createJob = function(jobname, timebooked, payment, clientid) {
    return orm.client.findById(clientid).then(function(client) {
        return client.addNewJob(jobname, timebooked, payment);
    });
};

/**
 * register.editJob - Edits the job specified with the data given
 *
 * @param  {Number} id   The id of the job
 * @param  {Object} data An object with the changed data
 * @return {Promise}     A promise with the edited job
 */
register.editJob = function(id, data) {
    return orm.job.findById(id).then(function(job) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].value !== "" && !Number.isNaN(data[i].value)) {
                job[data[i].name] = data[i].value;
            }
        }

        if (job.changed('payment')) {
            job.gst = job.payment / settings.GSTPercentage;
        }
        return job.save();
    });
};

/**
 * register.placed - Changes the state of the job to Placed
 *
 * @param  {Number} id The id of the job
 * @return {Promise}   A promise with the edited job
 */
register.placed = function(id) {
    var formData = [];

    formData.push({
        name: "state",
        value: "Placed"
    });
    return register.editJob(id, formData);
};

/**
 * register.done - Changes the state of the job to Done
 *
 * @param  {Number} id The id of the job
 * @return {Promise}   A promise with the job
 */
register.done = function(id) {
    var formData = [];

    formData.push({
        name: "state",
        value: "Done"
    });
    return register.editJob(id, formData);
};

//TODO: change into a function

/**
 * register.bulkUpdateJobList - Updates details for a list of jobs
 *
 * @param  {Array[Number]} idList An array with the id of jobs that need to be updated
 * @param  {Object} updateList    An object with the new data
 * @return {Promise}              A promise with the list updated
 */
register.bulkUpdateJobList = function(idList, updateList) {
    var query = {
        id: {
            $in: idList
        }
    };
    return orm.job.update(updateList, {
        where: query
    });
};

/**
 * register.jobListDone - Updates the state of the list of jobs to Done
 *
 * @param  {Array[Number]} idList An array with the id of jobs that need to be updated
 * @return {Promise}              A promise with the list updated
 */
register.jobListDone = function(idList) {
    return register.bulkUpdateJobList(idList, {
        state: "Done"
    });
};

/**
 * register.removeJob - description
 *
 * @param  {type} id description
 * @return {type}    description
 */
register.removeJob = function(id) {
    return orm.job.findById(id).then(function(job) {
        return job.destroy();
    });
};

/**
 * register.bulkDeleteJobs - Removes a list of jobs
 *
 * @param  {Array[Number]} idList An array with the id of jobs that need to be removed
 * @return {Promise}              A promise with the list removed
 */
register.bulkDeleteJobs = function(idList) {
    return orm.job.destroy({
        where: {
            id: {
                $in: idList
            }
        }
    });
};

/**
 * getJobPageCount - Gets the number of pages for the search specified
 *
 * @param  {Object} searchParams The search parameters
 * @return {Promise}             A promise with the count
 */
function getJobPageCount(searchParams) {
    return getCount(searchParams).then(function(count) {
        return Math.floor(count / 100);
    });
}

/**
 * getCount - Returns the count of jobs for the specifed search
 *
 * @param  {Object} searchParams The search parameters
 * @return {Promise}             A promise with the count
 */
function getCount(searchParams) {
    return orm.job.count({
        where: searchParams
    });
}

//TODO: changed that to parameters and not an object

/**
 * generateQuery - Generates an appropriate query with the given data
 *
 * @param  {Object} searchParams An object with the search parameters
 * @return {Object}              The search query
 */
function generateQuery(searchParams) {
    var query = {};

    if (searchParams.from !== undefined && searchParams.to !== undefined) {
        if (searchParams.from === undefined) {
            query.timeBooked = {
                lt: searchParams.to
            };
        } else if (searchParams.to === undefined) {
            query.timeBooked = {
                gt: searchParams.from
            };
        } else {
            query.timeBooked = {
                gt: searchParams.from,
                lt: searchParams.to
            };
        }
    }

    if (searchParams.state !== "" && searchParams.state !== undefined) {
        query.state = searchParams.state;
    }

    if (!Number.isNaN(searchParams.clientID) && searchParams.clientID !== undefined && searchParams.clientID !== "") {
        query.clientID = searchParams.clientID;
    }

    return query;
}

/**
 * initiateRegister - Returns the initiated register
 *
 * @return {Promise}  A promise with the Job Register
 */
function initiateRegister() {
    return require('../scripts/orm.js').then(function(data) {
        orm = data;
        return register;
    });
}

module.exports = initiateRegister();
