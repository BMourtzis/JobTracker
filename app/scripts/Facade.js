var clientRegister;
var jobRegister;
var schemeRegister;
var invoiceRegister;
var settingsRegister;
var backupRegister;

var facade = {};


/*
 ██████ ██      ██ ███████ ███    ██ ████████ ███████
██      ██      ██ ██      ████   ██    ██    ██
██      ██      ██ █████   ██ ██  ██    ██    ███████
██      ██      ██ ██      ██  ██ ██    ██         ██
 ██████ ███████ ██ ███████ ██   ████    ██    ███████
*/


/**
 * facade.getAllClients - Fetches all the clients
 *
 * @return {Promise}  A promise with a list of all the clients
 */
facade.getAllClients = function() {
    return clientRegister.getAllClients();
};

/**
 * facade.getClient - Fetches a client
 *
 * @param  {Number} id the id of the client
 * @return {Promise}    A promise with the client object
 */
facade.getClient = function(id) {
    return clientRegister.getClient(id);
};


/**
 * facade.getClientFull - Fetches a client and includes job and jobschmes of the client
 *
 * @param  {Number} id the id of the client
 * @return {Promise}    A promise with the client object
 */
facade.getClientFull = function(id) {
    return clientRegister.getClientFull(id);
};

/**
 * facade.createClient - Creates a client with the detail given
 *
 * @param  {String} firstname    The first name of the client
 * @param  {String} lastname     The last name of the client
 * @param  {String} businessname The name of the business
 * @param  {String} shortname    A shortname of the client, used for invoice naming. Up to 4 characters
 * @param  {String} address      The address of the business
 * @param  {String} email        The email of th client
 * @param  {Number} phone        The phone of the client
 * @return {Promise}              A promise with the newly created client
 */
facade.createClient = function(firstname, lastname, businessname, shortname, address, email, phone) {
    return clientRegister.createClient(firstname, lastname, businessname, shortname, address, email, phone).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};

/**
 * facade.editClient - Edits the client and saves it on the database
 *
 * @param  {Number} id   the id of the client
 * @param  {Object} data An object with the changes to the client
 * @return {Promise}      A promise with the edited client
 */
facade.editClient = function(id, data) {
    return clientRegister.editClient(id, data).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};

/**
 * facade.removeClient - Removes a client from the database
 *
 * @param  {Number} id the id of the client
 * @return {Promise}    an empty promise
 */
facade.removeClient = function(id) {
    return clientRegister.removeClient(id).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};


/*
     ██  ██████  ██████  ███████
     ██ ██    ██ ██   ██ ██
     ██ ██    ██ ██████  ███████
██   ██ ██    ██ ██   ██      ██
 █████   ██████  ██████  ███████
*/


/**
 * facade.getAllJobs - Fetches all jobs from the database
 *
 * @return {Promise}  A promise with all jobs
 */
facade.getAllJobs = function() {
    return jobRegister.getAllJobs();
};

/**
 * facade.getJob - Fetches a job from the database
 *
 * @param  {Number} id the id of the job
 * @return {Promise}    A promise with the job requested
 */
facade.getJob = function(id) {
    return jobRegister.getJob(id);
};

/**
 * facade.getJobFull - Fetches a job with the client included
 *
 * @param  {Number} id the id of the job
 * @return {Promise}    A promise with the requested job
 */
facade.getJobFull = function(id) {
    return jobRegister.getJobFull(id);
};

/**
 * facade.getDayJobs - Fetches jobs that are booked for the date specified
 *
 * @param  {Object (Date)} date Date for the jobs booked
 * @return {Promise}      A promise with a list of jobs
 */
facade.getDayJobs = function(date) {
    return jobRegister.getDayJobs(date);
};

/**
 * facade.getClientJobs - Returns jobs that belong to a specified client
 *
 * @param  {Object} searchParams The search parameters, in this case the client id
 * @param  {String} orderParams  Parameters the determine the order of the list
 * @param  {Number} page         The page of the list
 * @return {Promise}             A promise with a list of jobs
 */
facade.getClientJobs = function(searchParams, orderParams, page) {
    return jobRegister.getClientJobs(searchParams, orderParams, page);
};

/**
 * facade.getMonthJobs - Gets jobs for the specified month and client
 *
 * @param  {Number} clientId the id of the client
 * @param  {Date} date     the date to be searched, only the month and year will be used
 * @return {Promise}          A promise with a list of jobs
 */
facade.getMonthJobs = function(clientId, date) {
    return jobRegister.getMonthJobs(clientId, date);
};

/**
 * facade.getMonthJobs - Gets jobs for the specified month
 *
 * @param  {Date} date     the date to be searched, only the month and year will be used
 * @return {Promise}          A promise with a list of jobs
 */
facade.getJobsForMonth = function(date) {
    return jobRegister.getJobsForMonth(date);
}

/**
 * facade.searchJobs - Searches for jobs with the specified searchParams
 *
 * @param  {Object} searchParams Object that includes the params to be searched
 * @param  {String} orderParams  A string of the ordering that the list should come in
 * @param  {Number} page         The page of the list
 * @return {Promise}              A promise with a list
 */
facade.searchJobs = function(searchParams, orderParams, page) {
    return jobRegister.searchJobs(searchParams, orderParams, page);
};

/**
 * facade.getJobCount - Returns the count of jobs that belong the specified client
 *
 * @param  {Number} clientId the id of the client
 * @return {Promise}          A promise with the count
 */
facade.getJobCount = function(clientId) {
    return jobRegister.getJobCount(clientId);
};

/**
 * facade.getPendingJobCount - Returns the count of the pending jobs (that are placed) for the client specified
 *
 * @param  {Number} clientId the id of the client
 * @return {Promise}          A promise with the count
 */
facade.getPendingJobCount = function(clientId) {
    return jobRegister.getPendingJobCount(clientId);
};

/**
 * facade.createJob - Creates a new Job
 *
 * @param  {String} jobname    The name of the job
 * @param  {Date} timebooked   The date booked (should include time)
 * @param  {Number} payment    The payment
 * @param  {Number} clientid   the id of the client
 * @return {Promise}           A promise with the new client
 */
facade.createJob = function(jobname, timebooked, payment, clientid) {
    return jobRegister.createJob(jobname, timebooked, payment, clientid).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};

/**
 * facade.editJob - Edits a job
 *
 * @param  {Number} id   The id of the job
 * @param  {Object} data An object that contains the data to be changed
 * @return {Promise}      A promise with the edited job
 */
facade.editJob = function(id, data) {
    return jobRegister.editJob(id, data).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};

////State Machine for single objects

/**
 * facade.placed - Changes the state of the job to Placed
 *
 * @param  {Number} id The id of the job
 * @return {Promise}   A promise with the job
 */
facade.placed = function(id) {
    return jobRegister.placed(id).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};

/**
 * facade.done - Changes the state of the job to Done
 *
 * @param  {Number} id The if of the job
 * @return {Promise}    A promise with the edited job
 */
facade.done = function(id) {
    return jobRegister.done(id).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};

/**
 * facade.jobListDone - Changes the state of a list of jobs to Done
 *
 * @param  {Array} idList An array of ids
 * @return {Promise}        A promise with a list of jobs
 */
facade.jobListDone = function(idList) {
    return jobRegister.jobListDone(idList).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};

/**
 * facade.removeJob - Removes a job
 *
 * @param  {Number} id the id of the job
 * @return {Promise}    A promise with the edited job
 */
facade.removeJob = function(id) {
    return jobRegister.removeJob(id).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};

/**
 * facade.bulkDeleteJobs - Deletes a list of jobs
 *
 * @param  {Array} idList A list with the ids of the jobs
 * @return {Promise}        A promise with the deleted jobs
 */
facade.bulkDeleteJobs = function(idList) {
    return jobRegister.bulkDeleteJobs(idList).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};


/*
     ██  ██████  ██████      ███████  ██████ ██   ██ ███████ ███    ███ ███████ ███████
     ██ ██    ██ ██   ██     ██      ██      ██   ██ ██      ████  ████ ██      ██
     ██ ██    ██ ██████      ███████ ██      ███████ █████   ██ ████ ██ █████   ███████
██   ██ ██    ██ ██   ██          ██ ██      ██   ██ ██      ██  ██  ██ ██           ██
 █████   ██████  ██████      ███████  ██████ ██   ██ ███████ ██      ██ ███████ ███████
*/


/**
 * facade.getJobScheme - Fetches a job scheme
 *
 * @param  {Number} id the id of the jobScheme
 * @return {Promise}    A promise with a jobScheme
 */
facade.getJobScheme = function(id) {
    return schemeRegister.getJobScheme(id);
};

/**
 * facade.getJobSchemeFull - Fetches the jobScheme including the client information
 *
 * @param  {Number} id the id of the jobScheme
 * @return {Promise}    A promise with the jobScheme
 */
facade.getJobSchemeFull = function(id) {
    return schemeRegister.getJobSchemeFull(id);
};

facade.getClientJobScheme = function(clientId) {
    return schemeRegister.getClientJobScheme(clientId);
};

/**
 * facade.getActiveJobSchemes - Returns a list of all the active (enabled) jobSchemes
 *
 * @return {Promise}  A promise with a list of jobSchemes
 */
facade.getActiveJobSchemes = function() {
    return schemeRegister.getActiveJobSchemes();
};

/**
 * facade.getJobSchemeCount - Returns the count of the jobSchemes that belong to the specifed client
 *
 * @param  {Number} clientId the id of the client
 * @return {Promise}          A promise with the count
 */
facade.getJobSchemeCount = function(clientId) {
    return schemeRegister.getJobSchemeCount(clientId);
};

/**
 * facade.getActiveJobSchemeCount - Gets the count of active jobSchemes
 *
 * @param  {Number} clientId the id of the client that owns the jobSchemes
 * @return {Promise}          A promise with the count
 */
facade.getActiveJobSchemeCount = function(clientId) {
    return schemeRegister.getActiveJobSchemeCount(clientId);
};

/**
 * facade.getActiveJobSchemeSum - Sums up the payment of active jobSchemes
 *
 * @param  {Number} clientId the id of the client
 * @return {Promise}          A promise with sum
 */
facade.getActiveJobSchemeSum = function(clientId) {
    return schemeRegister.getActiveJobSchemeSum(clientId);
};

/**
 * facade.searchJobSchemes - Searches jobSchemes with the given parameters
 *
 * @param  {Object} searchParams An object with the parameters
 * @param  {Number} page         The page of jobSchemes list
 * @return {Promise}             A promise with a list of jobSchemes
 */
facade.searchJobSchemes = function(searchParams, page) {
    return schemeRegister.searchJobSchemes(searchParams, page);
};

/**
 * facade.createJobScheme - Create a new jobSchemes
 *
 * @param  {String} jobname          The name of the jobScheme
 * @param  {Number} payment          The payment of JobScheme
 * @param  {String} repetition       The repetition
 * @param  {Object} repetitionvalues The values to be repeated
 * @param  {Number} clientid         The id of the client
 * @return {Promise}                 A promise with the new JobScheme
 */
facade.createJobScheme = function(jobname, payment, repetition, repetitionvalues, clientid) {
    return schemeRegister.createJobScheme(jobname, payment, repetition, repetitionvalues, clientid).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};

/**
 * facade.editJobScheme - Edits the JobScheme
 *
 * @param  {Number} id   The id of the JobScheme
 * @param  {Object} data An object of the objects to be changed
 * @return {Promise}     A promise with the edited JobScheme
 */
facade.editJobScheme = function(id, data) {
    return schemeRegister.editJobScheme(id, data).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};

/**
 * facade.removeJobScheme - Removes a jobScheme
 *
 * @param  {Number} id the id of the jobScheme
 * @return {Promise}   A promise with the removed jobScheme
 */
facade.removeJobScheme = function(id) {
    return schemeRegister.removeJobScheme(id).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};

/**
 * facade.disableJobScheme - Disables a jobScheme
 *
 * @param  {Number} id the id of the jobScheme
 * @return {Promise}   A promise with the edited jobScheme
 */
facade.disableJobScheme = function(id) {
    return schemeRegister.disableJobScheme(id).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};

/**
 * facade.enableJobScheme - Enables a jobScheme
 *
 * @param  {Number} id the id of the jobScheme
 * @return {Promise}   A promise with the edited jobScheme
 */
facade.enableJobScheme = function(id) {
    return schemeRegister.enableJobScheme(id).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};

/**
 * facade.generateJobs - Generates Job with the JobScheme data
 *
 * @param  {Number} id    The id of jobScheme
 * @param  {Number} year  The year to generate jobs
 * @param  {Number} month The month to generate jobs
 * @return {Promise}      A promise with the newly created jobs
 */
facade.generateJobs = function(id, year, month) {
    return schemeRegister.generateJobs(id, year, month).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};

/**
 * facade.generateClientJobs - Generates jobs for all the jobSchemes of a client
 *
 * @param  {Number} clientId the id of the client
 * @param  {Number} year     The year to generate jobs
 * @param  {Number} month    The month to generate jobs
 * @return {Promise}         A promise with the newly created jobs
 */
facade.generateClientJobs = function(clientId, year, month) {
    return schemeRegister.generateClientJobs(clientId, year, month).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};


/*
██ ███    ██ ██    ██  ██████  ██  ██████ ███████ ███████
██ ████   ██ ██    ██ ██    ██ ██ ██      ██      ██
██ ██ ██  ██ ██    ██ ██    ██ ██ ██      █████   ███████
██ ██  ██ ██  ██  ██  ██    ██ ██ ██      ██           ██
██ ██   ████   ████    ██████  ██  ██████ ███████ ███████
*/


/**
 * facade.getCurrentInvoices - Fetches a list of the unpaid invoices
 *
 * @return {Promise}  A promise with a list of Invoices
 */
facade.getCurrentInvoices = function() {
    return invoiceRegister.getCurrentInvoices();
};

/**
 * facade.getInvoice - Fetches an invoice
 *
 * @param  {Number} invoiceId The id of the invoice
 * @return {Promise}          A promise with an invoice
 */
facade.getInvoice = function(invoiceId) {
    return invoiceRegister.getInvoice(invoiceId);
};

/**
 * facade.invoicePaid - Changes the state of an invoice to Paid
 *
 * @param  {Number} invoiceId The id of the invoice
 * @return {Promise}          A promise with the edited Invoice
 */
facade.invoicePaid = function(invoiceId) {
    return invoiceRegister.invoicePaid(invoiceId).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};

/**
 * facade.invoiceInvoiced - Changes the state of an invoice to Invoiced
 *
 * @param  {Number} invoiceId The id of the invoice
 * @return {Promise}          A promise with the invoice
 */
facade.invoiceInvoiced = function(invoiceId) {
    return invoiceRegister.invoiceInvoiced(invoiceId).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};

/**
 * facade.createInvoice - Creates a new Invoice
 *
 * @param  {type} id    description
 * @param  {type} year  description
 * @param  {type} month description
 * @return {type}       description
 */
facade.createInvoice = function(id, year, month) {
    return invoiceRegister.invoiceGeneration(id, year, month).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};
// TODO: maybe change the name
/**
 * facade.generateInvoice - Prints the invoice
 *
 * @param  {Number} invoiceId The id of the Invoice
 * @return {Promise}          A promsie with an invoice
 */
facade.printInvoice = function(invoiceId) {
    return invoiceRegister.printInvoice(invoiceId).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};

/**
 * facade.invoiceSearchOptions - Searches for invoices with the given parameters
 *
 * @param  {Object} searchParams Object with the search parameters
 * @param  {String} orderParams  String with the ordering of the list
 * @param  {Number} page         The page of the list
 * @return {Promise}             A promise with a list of invoices
 */
facade.invoiceSearchOptions = function(searchParams, orderParams, page) {
    return invoiceRegister.invoiceSearchOptions(searchParams, orderParams, page);
};

/**
 * facade.deleteInvoice - Deletes an invoicoe
 *
 * @param  {Number} invoiceId The id of the invoice
 * @return {Promise}          A promise with the deleted invoice
 */
facade.deleteInvoice = function(invoiceId) {
    return invoiceRegister.deleteInvoice(invoiceId).then(function(data) {
        backupRegister.updateBackup();
        return data;
    });
};

/**
 * facade.getInvoiceCount - Gets the count of the invoices for a client
 *
 * @param  {Number} clientId the id of the client
 * @return {Promise}         A promise with the count
 */
facade.getInvoiceCount = function(clientId) {
    return invoiceRegister.getInvoiceCount(clientId);
};

/**
 * facade.getPendingInvoiceCount - Gets the count of the pending (ivnoiced) invoices for a client
 *
 * @param  {Number} clientId The id of the client
 * @return {Promise}         A promise with the count
 */
facade.getPendingInvoiceCount = function(clientId) {
    return invoiceRegister.getPendingInvoiceCount(clientId);
};

/**
 * facade.getPaidSum - Gets the sum of the paid invoices for a client
 *
 * @param  {Number} clientId The id of the client
 * @return {Promise}         A promise with the sum
 */
facade.getPaidSum = function(clientId) {
    return invoiceRegister.getPaidSum(clientId);
};

/**
 * facade.getPendingSum - Gets the sum of the pending invoices for a client
 *
 * @param  {Number} clientId The id of the client
 * @return {Promise}         A promise with the sum
 */
facade.getPendingSum = function(clientId) {
    return invoiceRegister.getPendingSum(clientId);
};


/*
███████ ███████ ████████ ████████ ██ ███    ██  ██████  ███████
██      ██         ██       ██    ██ ████   ██ ██       ██
███████ █████      ██       ██    ██ ██ ██  ██ ██   ███ ███████
     ██ ██         ██       ██    ██ ██  ██ ██ ██    ██      ██
███████ ███████    ██       ██    ██ ██   ████  ██████  ███████
*/


/**
 * facade.UpdateInvoiceTemplatePath - Updates the invoice template path in the settings filr
 *
 * @param  {String} path The new path of the invoice template
 * @return {Promise}    description
 */
facade.UpdateInvoiceTemplatePath = function(path) {
    return settingsRegister.UpdateInvoiceTemplatePath(path);
};

/**
 * facade.UpdateInvoiceOutputPath - Updates the invoice output path
 *
 * @param  {String} path THe new path of the invoice output path
 * @return {Promise}     description
 */
facade.UpdateInvoiceOutputPath = function(path) {
    return settingsRegister.UpdateInvoiceOutputPath(path);
};

/**
 * facade.UpdateBackupPath - Updates the path that the backups are stored
 *
 * @param  {String} path The new path of the backup folder
 * @return {Promise}     description
 */
facade.UpdateBackupPath = function(path) {
    return settingsRegister.UpdateBackupPath(path);
};

/**
 * facade.UpdateGSTPercentage - Updates the GST Percentage used
 *
 * @param  {Number} gst The new GST percentage
 * @return {Promise}    description
 */
facade.UpdateGSTPercentage = function(gst) {
    return settingsRegister.UpdateGSTPercentage(gst);
};


/*
███████  █████   ██████  █████  ██████  ███████
██      ██   ██ ██      ██   ██ ██   ██ ██
█████   ███████ ██      ███████ ██   ██ █████
██      ██   ██ ██      ██   ██ ██   ██ ██
██      ██   ██  ██████ ██   ██ ██████  ███████

███████ ██    ██ ███    ██  ██████ ████████ ██  ██████  ███    ██ ███████
██      ██    ██ ████   ██ ██         ██    ██ ██    ██ ████   ██ ██
█████   ██    ██ ██ ██  ██ ██         ██    ██ ██    ██ ██ ██  ██ ███████
██      ██    ██ ██  ██ ██ ██         ██    ██ ██    ██ ██  ██ ██      ██
██       ██████  ██   ████  ██████    ██    ██  ██████  ██   ████ ███████
*/


/**
 * initiateFacade - Initiates the Facade by waiting for the registers to load
 *
 * @return {Object}  The facade
 */
function initiateFacade(orm) {
    var clients = require('../Registers/ClientRegister.js')(orm).then(function(data) {
        clientRegister = data;
    });

    var jobs = require('../Registers/JobRegister.js')(orm).then(function(data) {
        jobRegister = data;
    });

    var schemes = require('../Registers/JobSchemeRegister.js')(orm).then(function(data) {
        schemeRegister = data;
    });

    var invoices = require('../Registers/InvoiceRegister.js')(orm).then(function(data) {
        invoiceRegister = data;
    });

    settingsRegister = require('../Registers/SettingsRegister.js');
    backupRegister = require('../Registers/BackupRegister');

    return Promise.all([clients, jobs, schemes, invoices]).then(function(data) {
        return facade;
    });
}

module.exports = initiateFacade;
