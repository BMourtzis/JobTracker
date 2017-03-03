var orm;

var register = {};

//Get all Jobs
register.getAllJobs = function(){
    var searchParams = {
        from: Date.today().last().year().set({month: 0, day: 1}),
        to: Date.today().set({month: 11, day: 31}).at({hour: 23, minute: 59})
    };


    return register.FindJobs(register.generateQuery(searchParams), "timeBooked DESC", 0);
};

//Search Functions
////Simple Search
register.getJob = function(id) {
    return orm.job.findById(id).then(function(query){
        return query.get({plain:true});
    });
};

////Gets the specifed job and includes the client
register.getJobFull = function(id){
    return orm.job.findById(id,{include: [orm.client]}).then(function(query) {
        return query.get({plain:true});
    });
};

////Gets a job of a specified client
register.getJobfromClient = function(clientId, jobId){
    return orm.client.findById(id,{
        include:[{
            model: orm.job,
            where:{
                id: jobId
            }
        }]
    }).then(function(data){
        return data.get({plain:true});
    });
};

//Advanced Search
////Gets the jobs of the specified date
register.getDayJobs = function(from) {
    var searchParams = {
        from: moment(from),
        to: moment(new Date(from).at({hour: 23, minute: 59}))
    };

    return register.FindJobs(register.generateQuery(searchParams), "timeBooked ASC", 0);
};

////Searches jobs with the specified parameters.
////It allows for pagination and order specification
register.FindJobs = function(searchParams, orderParams, page) {
    if(!Number.isInteger(page)) {
        page = 0;
    }

    return orm.job.findAll({
        include: [orm.client, orm.invoice],
        where: searchParams,
        order: orderParams,
        offset: page*100,
        limit: 100
    }).then(function(query){
        return register.getJobPageCount(searchParams).then(function(count){
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

////Gets the jobs from a client
register.getClientJobs = function(searchParams, orderParams, page){
    if(orderParams === "") {
        orderParams = "timeBooked DESC";
    }

    return register.FindJobs(register.generateQuery(searchParams), orderParams, page);
};

//Returns Jobs for the specified month
register.getMonthJobs = function(clientId, date){
    var from = new Date(date).set({day: 1});
    var to = new Date(from).set({day:from.getDaysInMonth(), hour: 23, minute: 59});

    return orm.job.findAll({
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

////Searches for jobs
register.searchJobs = function(searchParams, orderParams, page) {
    if(orderParams === "") {
        orderParams = "timeBooked DESC";
    }

    return register.FindJobs(register.generateQuery(searchParams), orderParams, page);
};

////Gets the count of the jobs for a specified search
register.getJobPageCount = function(searchParams){
    return orm.job.count({
        where: searchParams
    }).then(function (count) {
        return Math.floor(count/100);
    });
};

//Query Generator Helper
register.generateQuery = function(searchParams) {
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

    if(searchParams.state !== "" && searchParams.state !== undefined){
        query.state = searchParams.state;
    }

    if(!Number.isNaN(searchParams.clientID) && searchParams.clientID !== undefined && searchParams.clientID !== ""){
        query.clientID = searchParams.clientID;
    }

    return query;
};

//Create Functions
register.createJob = function(jobname, timebooked, payment, clientid) {
    return orm.client.findById(clientid).then(function(client) {
        return client.addNewJob(jobname, timebooked, payment);
    });
};

//Edit Function
register.editJob = function(id, data){
    return orm.job.findById(id).then(function(job){
        for (var i = 0; i < data.length; i++) {
            if(data[i].value !== "" && !Number.isNaN(data[i].value))
            {
                job[data[i].name] = data[i].value;
            }
        }

        if(job.changed('payment')){
            job.gst = job.payment/settings.GSTPercentage;
        }
        return job.save();
    });
};

//State Machine for single objects
register.placed = function(id){
    var formData = [];

    formData.push({
        name: "state",
        value: "Placed"
    });
    return register.editJob(id, formData);
};

register.done = function(id){
    var formData = [];

    formData.push({
        name: "state",
        value: "Done"
    });
    return register.editJob(id, formData);
};

register.invoice = function(id) {
    var formData = [];

    formData.push({
        name: "state",
        value: "Invoiced"
    });
    return register.editJob(id, formData);
};

register.paid = function(id){
    var formData = [];

    formData.push({
        name: "state",
        value: "Paid"
    });
    return register.editJob(id, formData);
};

//List State Machine
register.bulkUpdateJobList = function(idList, updateList){
    var query = {
        id: {$in: idList}
    };
    return orm.job.update(updateList, {where: query});
};

register.jobListDone = function(idList) {
    return register.bulkUpdateJobList(idList, {state: "Done"});
};

register.jobListInvoiced = function(idList, invoiceId) {
    return register.bulkUpdateJobList(idList, {state: "Invoiced", invoiceId: invoiceId});
};

register.jobListPaid = function(idList) {
    return register.bulkUpdateJobList(idList, {state: "Paid"});
};

////Remove Functions
register.removeJob = function(id){
    return orm.job.findById(id).then(function(job){
        return job.destroy();
    });
};

register.bulkDeleteJobs = function(idList) {
    return orm.job.destroy({
        where: {id:{$in: idList}}
    });
};

module.exports = function getRegister(){
    return require('../scripts/orm.js')().then(function(data){
        orm = data;
        return register;
    });
};
