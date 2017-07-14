var orm = require('../scripts/orm.js');

var register = {};

/**
 * register.getInvoice - Fetches a invoice
 *
 * @param  {Number} id The id of the invoice
 * @return {Promise}   A promise with an invoice
 */
register.getInvoice = function(id) {
    return orm.invoice.findById(id, {
        include: [orm.job, orm.client]
    }).then(function(data) {
        return data.get({
            plain: true
        });
    });
};

/**
 * register.getCurrentInvoices - Fetches unpaid invoices
 *
 * @return {Promise}  A promise with a list of invoices
 */
register.getCurrentInvoices = function() {
    return findInvoices(generateQuery({
        paid: false
    }), "invoiceNo ASC", 0);
};

/**
 * register.invoiceSearchOptions - Searches for invoices
 *
 * @param  {Object} searchParams An object with the search criteria
 * @param  {String} orderParams  A string with the ordering
 * @param  {Number} page         The page of the list
 * @return {Promise}             A promise with a list of invoices
 */
register.invoiceSearchOptions = function(searchParams, orderParams, page) {
    return findInvoices(generateQuery(searchParams), "", page);
};

/**
 * register.invoiceGeneration - checks the id number and it will generate 1 or many invoices
 *
 * @param  {Number} id    The id of the client, if is 0, it will generate invoices for all the clients
 * @param  {Number} year  The year that the invoice will generated for
 * @param  {Number} month The month that the invoice will generated for
 * @return {Promise}      Promise with a list of invoices
 */
register.invoiceGeneration = function(id, year, month) {
    if (id === 0) {
        return generateAllInvoices(year, month);
    } else {
        return register.createInvoice(year, month, id);
    }
};

/**
 * register.createInvoice - Creates a new invoice for the client, year and month specified
 *
 * @param  {Number} year     The year that the invoice will generated for
 * @param  {Number} month    The month that the invoice will generated for
 * @param  {Number} clientId The id of the client
 * @return {Promise}         description
 */
register.createInvoice = function(year, month, clientId) {
    return getJobs(year, month, clientId, "Done").then(function(client) {
        if (client) {
            var clientData = client.get({
                plain: true
            });
            var sum = 0;
            clientData.jobs.forEach(function(job) {
                sum += job.payment + job.gst;
            });

            sum = Math.round(sum * 10) / 10;
            var date = new Date.today().set({
                year: year,
                month: month - 1,
                day: 1
            });
            var invoiceNo = clientData.shortName + date.toString("yy") + date.toString("MM");

            if (client.jobs.length > 0) {
                return client.addNewInvoice(year, month, sum, invoiceNo).then(function(data) {
                    return InvoiceJobList(clientData.jobs, data.id).then(function(smth) {
                        return generateInvoice(data.id).then(function() {
                            return data.id;
                        });
                    });
                }, function(err) {
                    console.log(err);
                });
            }
        }
    });
};

/**
 * register.printInvoice - A facade method that calls generate invoice
 *
 * @param  {Number} invoiceId The id of the invoice
 * @return {Promise}          A promise with a boolean
 */
register.printInvoice = function(invoiceId) {
    return generateInvoice(invoiceId);
};

/**
 * register.invoicePaid - Changes the state of the invoice to Paid
 *
 * @param  {Number} invoiceId The id of the invoice
 * @return {Promise}          A promise with the edited invoice
 */
register.invoicePaid = function(invoiceId) {
    return orm.invoice.findById(invoiceId, {
        include: [orm.job]
    }).then(function(invoice) {
        invoice.paid = true;
        invoice.paidAt = new Date.today();

        return invoice.save().then(function(data) {
            return data.get({
                plain: true
            });
        });

    }).then(function(data) {
        return PaidJobList(data.jobs).then(function() {
            return data;
        });
    });
};

/**
 * register.invoiceInvoiced - Changes the state of the invoice to Invoiced
 *
 * @param  {Number} invoiceId The id of the Invoice
 * @return {Promise}          A promise with the edited Invoice
 */
register.invoiceInvoiced = function(invoiceId) {
    return orm.invoice.findById(invoiceId, {
        include: [orm.job]
    }).then(function(invoice) {
        invoice.paid = false;
        invoice.paidAt = null;

        return invoice.save().then(function(data) {
            return data.get({
                plain: true
            });
        });

    }).then(function(data) {
        return InvoiceJobList(data.jobs, invoiceId).then(function() {
            return data;
        });
    });
};

/**
 * register.generateInvoice - Generates and saves an invoice into a new docx file
 *
 * @param  {Number} invoiceId The id of the Invoice
 * @return {Promise}          A promise with a boolean
 */
function generateInvoice(invoiceId) {
    //dependencies
    var JSZip = require('jszip');
    var docxtemplater = require('docxtemplater');

    //TODO: find how to make proper errors
    if (!fs.existsSync(settings.InvoiceTemplatePath)) {
        var dialog = require('electron').remote.dialog;
        dialog.showErrorBox("Error!", "The Receipt Template doesn't exist.");
        var err = {
            Error: "Receipt Template doesn't exist."
        };
        throw err;
    }

    var content = fs.readFileSync(settings.InvoiceTemplatePath, "binary");
    var zip = new JSZip(content);
    var doc = new docxtemplater();
    doc.loadZip(zip);

    return register.getInvoice(invoiceId).then(function(invoice) {
        invoice.subtotal = 0;
        for (var i = 0; i < invoice.jobs.length; i++) {
            invoice.jobs[i].timeBooked = new Date(invoice.jobs[i].timeBooked).toString("dd/MM/yyyy");
            invoice.subtotal += invoice.jobs[i].payment;
        }

        invoice.gst = Math.round((invoice.total - invoice.subtotal) * 10) / 10;

        var period = new Date().set({
            year: invoice.year,
            month: invoice.month - 1
        });
        invoice.issueDate = new Date.today().toString("dd-MM-yyyy");
        invoice.invoicePeriod = period.toString("MMMM yyyy");
        invoice.address = invoice.client.address;

        return getJobs(invoice.year, invoice.month + 1, invoice.clientId, "Placed").then(function(data) {
            if (data) {
                data = data.get({
                    plain: true
                });
                var nextServ = [];
                for (var i = 0; i < data.jobs.length; i++) {
                    nextServ.push(new Date(data.jobs[i].timeBooked).toString("dd/MM/yyyy"));
                }
                return nextServ;
            }
            return "";
        }).then(function(data) {

            invoice.nextServices = data;

            doc.setData(invoice);
            doc.render();

            var buf = doc.getZip().generate({
                type: "nodebuffer"
            });
            var invoiceFolder = checkCreateDirectory(period.toString("yyyy"), period.toString("MM"));
            fs.writeFileSync(path.resolve(invoiceFolder, invoice.client.businessName + ".docx"), buf);

            return true;
        });
    });
}

/**
 * register.deleteInvoice - Deletes and invoice
 *
 * @param  {Number} invoiceId The id of the Invoice
 * @return {Promise}          A promise with the deleted invoice
 */
register.deleteInvoice = function(invoiceId) {
    return orm.invoice.findById(invoiceId, {
        include: [orm.client, orm.job]
    }).then(function(invoice) {
        var invoiceData = invoice.get({
            plain: true
        });
        return DoneJobList(invoiceData.jobs, invoiceId).then(function() {
            return invoice.destroy();
        });
    });
};

/**
 * register.getInvoiceCount - Gets the total number of invoices that belong to a client
 *
 * @param  {Number} clientId The id of the Client
 * @return {Promise}         A promise with the count
 */
register.getInvoiceCount = function(clientId) {
    return getCount(generateQuery({
        clientID: clientId
    }));
};

/**
 * register.getPendingInvoiceCount - Gets the total count of pending invoices that belong to a client
 *
 * @param  {Number} clientId The id of the Client
 * @return {Promise}         A promise with count
 */
register.getPendingInvoiceCount = function(clientId) {
    return getCount(generateQuery({
        clientID: clientId,
        paid: false
    }));
};

/**
 * register.getPaidSum - Gets the sum of the paid invoices that belong to a client
 *
 * @param  {Number} clientId The id of the Client
 * @return {Promise}         A promise with sum
 */
register.getPaidSum = function(clientId) {
    return getTotalSum(generateQuery({
        clientID: clientId
    }));
};

/**
 * register.getPendingSum - Gets the sum of the pending invoice that belong to a client
 *
 * @param  {Number} clientId The id of the Client
 * @return {Promise}         A promise with the sum
 */
register.getPendingSum = function(clientId) {
    return getTotalSum(generateQuery({
        clientID: clientId,
        paid: false
    }));
};

/**
 * checkCreateDirectory - Checks if the directory exists, if not it creates the folders
 *
 * @param  {Number} year       The year of the invoice
 * @param  {Number} month      The month of the invoice
 * @return {String}            The final folder directory
 */
function checkCreateDirectory(year, month) {
    baseFolder = settings.InvoiceOutputPath;
    if (!fs.existsSync(baseFolder)) {
        fs.mkdirSync(baseFolder);
    }

    baseFolder = path.resolve(baseFolder, year + "/");
    if (!fs.existsSync(baseFolder)) {
        fs.mkdirSync(baseFolder);
    }

    var date = new Date().set({
        month: parseInt(month) - 1
    }); // NOTE: Use this after they have transition to the new software

    baseFolder = path.resolve(baseFolder, month + "/");
    if (!fs.existsSync(baseFolder)) {
        fs.mkdirSync(baseFolder);
    }
    return baseFolder;
}

/**
 * generateAllInvoices - Generates all the invoice for the month specified
 *
 * @param  {Number} year  The year of the invoices
 * @param  {Number} month The month of the invoices
 * @return {Promise}      A chained promise for all the invoices of the month
 */
function generateAllInvoices(year, month) {
    return orm.client.findAll().then(function(data) {
        return Promise.resolve(0).then(function loop(i) {
            if (i < data.length) {
                return createInvoicePromiseHelper(i, data, year, month).then(function() {
                    i++;
                    return loop(i);
                });
            }
        });
    });
}

/**
 * createInvoicePromiseHelper - A helper function that creates a new promise. When it is solved it calls loop again to get the next invoice created
 *
 * @param  {Number} i              The location of the client in the array
 * @param  {Object(Invoice)} data  An array holding all the clients that have done jobs in the month
 * @param  {Number} year           The year that the invoice is going to be created
 * @param  {Number} month          The month that the invoice is going to be created
 * @return {Promise}               A promise that when done it will call the loop functin again
 */
function createInvoicePromiseHelper(i, data, year, month) {
    return new Promise(function(resolve) {
        var clientData = data[i].get({
            plain: true
        });
        return register.createInvoice(year, month, clientData.id).then(function() {
            resolve();
        });
    });
}

//TODO: fix bug where 1/12/16 - 31/03/17 doesn't work properly

/**
 * generateQuery - Generates the proper query format with the given searchParams
 *
 * @param  {Object} searchParams Data taken from the search Form
 * @return {Object}              Formatted data that will be used as the query
 */
function generateQuery(searchParams) {
    var query = {};

    if (searchParams.from !== undefined && searchParams.to !== undefined) {
        if (searchParams.from === undefined) {
            query.year = {
                lt: parseInt(searchParams.to.toString("yyyy"))
            };

            query.month = {
                lt: parseInt(searchParams.to.toString("MM"))
            };
        } else if (searchParams.to === undefined) {
            query.year = {
                gt: parseInt(searchParams.from.toString("yyyy"))
            };

            query.month = {
                gt: parseInt(searchParams.from.toString("MM"))
            };
        } else {
            query.year = {
                lt: parseInt(searchParams.to.toString("yyyy")),
                gt: parseInt(searchParams.from.toString("yyyy"))
            };

            if (query.year.lt === query.year.gt) {
                query.year = parseInt(searchParams.to.toString("yyyy"));
            }

            query.month = {
                lt: parseInt(searchParams.to.toString("MM")) + 1,
                gt: parseInt(searchParams.from.toString("MM"))
            };

            if (query.month.lt === query.month.gt) {
                query.month = parseInt(searchParams.to.toString("MM"));
            }
        }
    }

    if (searchParams.paid !== "" && searchParams.paid !== undefined) {
        query.paid = searchParams.paid;
    }

    if (!Number.isNaN(searchParams.clientID) && searchParams.clientID !== undefined && searchParams.clientID !== "") {
        query.clientID = searchParams.clientID;
    }

    return query;
}

/**
 * findInvoices - Search for invoices with the given search Parameters, orders them and limits them to the specified page
 *
 * @param  {Object} searchParams Object with the data to search
 * @param  {String} orderParams  String with the order parameters
 * @param  {Number} page         The page of the list
 * @return {Promise}             A promise with a list of invoices
 */
function findInvoices(searchParams, orderParams, page) {
    if (orderParams === "") {
        orderParams = "year DESC, month DESC";
    }

    return orm.invoice.findAll({
        where: searchParams,
        include: [orm.client],
        order: orderParams,
        offset: page * 100,
        limit: 100
    }).then(function(query) {
        return getPageCount(searchParams).then(function(count) {
            var data = {};
            data.count = count;
            data.invoices = [];
            query.forEach(function(invoice) {
                data.invoices.push(invoice.get({
                    plain: true
                }));
            });
            return data;
        });
    });
}

/**
 * getPageCount - Gets the number of pages exists in a search
 *
 * @param  {Object} searchParams Search parameters
 * @return {Number}              The number of pages
 */
function getPageCount(searchParams) {
    return getCount(searchParams).then(function(count) {
        return Math.floor(count / 100);
    });
}

/**
 * getCount - Gets the total number of invoices for a search
 *
 * @param  {Object} searchParams Search Parameters
 * @return {Number}              The total count of invoices for that search
 */
function getCount(searchParams) {
    return orm.invoice.count({
        where: searchParams
    });
}

/**
 * getTotalSum - Gets the sum of JobSchemes for the search
 *
 * @param  {Object} searchParams Search Parameters
 * @return {Number}              The total sum of the searched jobs
 */
function getTotalSum(searchParams) {
    return orm.jobScheme.sum('payment', {
        where: searchParams
    });
}

/**
 * getTotalSum - Gets the sum of invoices for the search
 *
 * @param  {Object} searchParams Search Parameters
 * @return {Number}              The total sum of the searched jobs
 */
function getTotalSum(searchParams) {
    return orm.invoice.sum('total', {
        where: searchParams
    });
}

/**
 * getJobs - Fetches jobs based on the parameters
 *
 * @param  {Number} year     The year the jobs are booked
 * @param  {Number} month    The month the jobs are booked
 * @param  {Number} clientId The id of the client the jobs belong
 * @param  {String} state    The state of the jobs
 * @return {Promise}         A promise with a list of jobs
 */
function getJobs(year, month, clientId, state) {
    var from = new Date.today().set({
        year: year,
        month: month - 1,
        day: 1
    });
    var to = new Date(from).set({
        day: from.getDaysInMonth(),
        hour: 23,
        minute: 59
    });

    return orm.client.findOne({
        where: {
            id: clientId
        },
        include: [{
            model: orm.job,
            where: {
                timeBooked: {
                    gt: from,
                    lt: to
                },
                state: state
            }
        }],
        order: "timeBooked ASC"
    });
}

/**
 * updateJobList - Updates a list of jobs with new data
 *
 * @param  {Array} jobs        A list of jobs to be updated
 * @param  {Object} updateList An object with the data to be updated
 * @return {Promise}           A promise with with a list of the updated jobs
 */
function updateJobList(jobs, updateList) {
    var idList = [];
    if (jobs.length > 0) {
        jobs.forEach(function(job) {
            idList.push(job.id);
        });
    }

    return orm.job.update(updateList, {
        where: {
            id: {
                $in: idList
            }
        }
    });
}

/**
 * DoneJobList - Updates the list of jobs with the Done state and a new InvoiceId
 *
 * @param  {Array} jobs       A list of jobs
 * @param  {Number} invoiceId The id of the invoice
 * @return {Promise}          A promise with the updated jobs
 */
function DoneJobList(jobs, invoiceId) {
    return updateJobList(jobs, {
        state: "Done",
        invoiceId: null
    });
}

/**
 * InvoiceJobList - Updates the list of jobs with the Invoiced state and a new InvoiceId
 *
 * @param  {Array} jobs       A list of jobs
 * @param  {Number} invoiceId The id of the invoice
 * @return {Promise}          A promise with the updated jobs
 */
function InvoiceJobList(jobs, invoiceId) {
    return updateJobList(jobs, {
        state: "Invoiced",
        invoiceId: invoiceId
    });
}

/**
 * PaidJobList - Updates the list of jobs with the Paid state and a new InvoiceId
 *
 * @param  {Array} jobs       A list of jobs
 * @return {Promise}          A promise with the updated jobs
 */
function PaidJobList(jobs) {
    return updateJobList(jobs, {
        state: "Paid"
    });
}

/**
 * initiateRegister - Initiates the Register
 *
 * @return {Promise}  The Invoice Register
 */
function initiateRegister(injORM) {
    orm = injORM;
    return register;
}

module.exports = initiateRegister;
