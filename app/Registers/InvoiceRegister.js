var orm = require('../scripts/orm.js');

var register = {};

register.getInvoice = function(id){
    return orm.invoice.findById(id,{
        include:[orm.job, orm.client]
    }).then(function(data){
        return data.get({plain:true});
    });
};

register.getCurrentInvoices = function() {
    return findInvoices(generateQuery({paid: false}),"invoiceNo ASC", 0);
};

register.invoiceSearchOptions = function(searchParams, orderParams, page) {
    return findInvoices(generateQuery(searchParams), "", page);
};

register.invoiceGeneration = function(id, year, month) {
    if(id === 0){
        return generateAllInvoices(year, month);
    }
    else {
        return register.createInvoice(year, month, id);
    }
};


register.createInvoice = function(year, month, clientId) {
    return getJobs(year, month, clientId, "Done").then(function(client) {
        if(client){
            var clientData = client.get({plain: true});
            var sum = 0;
            clientData.jobs.forEach(function(job) {
                sum += job.payment + job.gst;
            });

            sum = Math.round(sum*10)/10;
            var date = new Date.today().set({year: year, month: month-1, day: 1});
            var invoiceNo = clientData.shortName + date.toString("yy") + date.toString("MM");

            if(client.jobs.length > 0) {
                return client.addNewInvoice(year, month, sum, invoiceNo).then(function(data) {
                    return InvoiceJobList(clientData.jobs, data.id).then(function(smth){
                        return register.generateInvoice(data.id).then(function(){
                            return data.id;
                        });
                    });
                }, function(err){ console.log(err);});
            }
        }
    });
};

register.printInvoice = function(invoiceId) {
    return generateInvoice(invoiceId);
};

register.invoicePaid = function(invoiceId) {
    return orm.invoice.findById(invoiceId, {include:[orm.job]}).then(function(invoice) {
        invoice.paid = true;
        invoice.paidAt = new Date.today();

        return invoice.save().then(function(data){
            return data.get({plain:true});
        });

    }).then(function(data){
        return PaidJobList(data.jobs).then(function(){
            return data;
        });
    });
};

register.invoiceInvoiced = function(invoiceId) {
    return orm.invoice.findById(invoiceId, {include:[orm.job]}).then(function(invoice) {
        invoice.paid = false;
        invoice.paidAt = null;

        return invoice.save().then(function(data){
            return data.get({plain:true});
        });

    }).then(function(data){
        return InvoiceJobList(data.jobs, invoiceId).then(function(){
            return data;
        });
    });
};

register.generateInvoice = function(invoiceId) {
    //dependencies
    var JSZip = require('jszip');
    var docxtemplater = require('docxtemplater');

    //TODO: find how to make proper errors
    if(!fs.existsSync(settings.InvoiceTemplatePath)) {
        var dialog = require('electron').remote.dialog;
        dialog.showErrorBox("Error!", "The Receipt Template doesn't exist.");
        var err = {Error: "Receipt Template doesn't exist."};
        throw err;
    }

    var content = fs.readFileSync(settings.InvoiceTemplatePath, "binary");
    var zip = new JSZip(content);
    var doc = new docxtemplater();
    doc.loadZip(zip);

    return register.getInvoice(invoiceId).then(function(invoice){
        invoice.subtotal = 0;
        for(var i = 0; i< invoice.jobs.length; i++){
            invoice.jobs[i].timeBooked = new Date(invoice.jobs[i].timeBooked).toString("dd/MM/yyyy");
            invoice.subtotal += invoice.jobs[i].payment;
        }

        invoice.gst = invoice.total - invoice.subtotal;

        var period = new Date().set({year: invoice.year, month: invoice.month-1});
        invoice.issueDate = new Date.today().toString("dd-MM-yyyy");
        invoice.invoicePeriod = period.toString("MMMM yyyy");
        invoice.address = invoice.client.address;

        return getJobs(invoice.year, invoice.month+1, invoice.clientId, "Placed").then(function(data){
            if(data) {
                data = data.get({plain: true});
                var nextServ = [];
                for(var i = 0; i < data.jobs.length; i++){
                    nextServ.push(new Date(data.jobs[i].timeBooked).toString("dd/MM/yyyy"));
                }
                return nextServ;
            }
            return "";
        }).then(function(data) {

            invoice.nextServices = data;

            doc.setData(invoice);
            doc.render();

            var buf = doc.getZip().generate({type: "nodebuffer"});
            var invoiceFolder = checkCreateDirectory(period.toString("yyyy"), period.toString("MM"), settings.InvoiceOutputPath);
            fs.writeFileSync(path.resolve(invoiceFolder, invoice.client.businessName+".docx"), buf);

            return true;
        });
    });
};

register.deleteInvoice = function(invoiceId) {
    return orm.invoice.findById(invoiceId, {include:[orm.client, orm.job]}).then(function(invoice){
        var invoiceData = invoice.get({plain:true});
        return DoneJobList(invoiceData.jobs, invoiceId).then(function(){
            return invoice.destroy();
        });
    });
};


function checkCreateDirectory(year,month, baseFolder) {

    if(!fs.existsSync(baseFolder)){
        fs.mkdirSync(baseFolder);
    }

    baseFolder = path.resolve(baseFolder, year+"/");
    if(!fs.existsSync(baseFolder)) {
        fs.mkdirSync(baseFolder);
    }

    baseFolder = path.resolve(baseFolder, month+"/");
    if(!fs.existsSync(baseFolder)){
        fs.mkdirSync(baseFolder);
    }
    return baseFolder;
}

function generateAllInvoices(year, month) {
    return orm.client.findAll().then(function(data){
        return Promise.resolve(0).then(function loop(i){
            if(i < data.length){
                return createInvoicePromiseHelper(i, data, year, month).then(function(){
                    i++;
                    return loop(i);
                });
            }
        });
    });
}

function createInvoicePromiseHelper(i, data, year, month) {
    return new Promise(function(resolve){
        var clientData = data[i].get({plain: true});
        return register.createInvoice(year, month, clientData.id).then(function(){
            resolve();
        });
    });
}

//TODO: fix bug where 1/12/16 - 31/03/17 doesn't work properly
function generateQuery(searchParams) {
    var query = {};

    if(searchParams.from !== undefined && searchParams.to !== undefined){
        if(searchParams.from === undefined){
            query.year = {
                lt: parseInt(searchParams.to.toString("yyyy"))
            };

            query.month = {
                lt: parseInt(searchParams.to.toString("MM"))
            };
        }
        else if(searchParams.to === undefined){
            query.year = {
                gt: parseInt(searchParams.from.toString("yyyy"))
            };

            query.month = {
                gt: parseInt(searchParams.from.toString("MM"))
            };
        }
        else{
            query.year = {
                lt: parseInt(searchParams.to.toString("yyyy")),
                gt: parseInt(searchParams.from.toString("yyyy"))
            };

            if(query.year.lt === query.year.gt) {
                query.year = parseInt(searchParams.to.toString("yyyy"));
            }

            query.month = {
                lt: parseInt(searchParams.to.toString("MM"))+1,
                gt: parseInt(searchParams.from.toString("MM"))
            };

            if(query.month.lt === query.month.gt) {
                query.month = parseInt(searchParams.to.toString("MM"));
            }
        }
    }

    //make into paid
    if(searchParams.paid !== "" && searchParams.paid !== undefined){
        query.paid = searchParams.paid;
    }

    if(!Number.isNaN(searchParams.clientID) && searchParams.clientID !== undefined && searchParams.clientID !== ""){
        query.clientID = searchParams.clientID;
    }

    console.log(query);

    return query;
}

function findInvoices(searchParams, orderParams, page){
    if(orderParams === "") {
        orderParams = "year DESC, month DESC";
    }

    return orm.invoice.findAll({
        where: searchParams,
        include:[orm.client],
        order: orderParams,
        offset: page*100,
        limit: 100
    }).then(function(query) {
        return getPageCount(searchParams).then(function(count){
            var data = {};
            data.count = count;
            data.invoices = [];
            query.forEach(function(invoice){
                data.invoices.push(invoice.get({plain:true}));
            });
            return data;
        });
    });
}

function getPageCount(searchParams) {
    return getCount(searchParams).then(function (count) {
        return Math.floor(count/100);
    });
}

function getCount(searchParams) {
    return orm.invoice.count({
        where: searchParams
    });
}

function getTotalSum(searchParams){
    return orm.jobScheme.sum('payment',{
        where: searchParams
    });
}

function getTotalSum(searchParams) {
    return orm.invoice.sum('total',{
        where: searchParams
    });
}

register.getInvoiceCount = function(clientId) {
    return getCount(generateQuery({clientID: clientId}));
};

register.getPendingInvoiceCount = function(clientId) {
    return getCount(generateQuery({clientID: clientId, paid: false}));
};

register.getPaidSum = function(clientId) {
    return getTotalSum(generateQuery({clientID: clientId}));
};

register.getPendingSum = function(clientId) {
    return getTotalSum(generateQuery({clientID: clientId, paid: false}));
};

function getJobs(year, month, clientId, state) {
    var from = new Date.today().set({year: year, month: month-1, day: 1});
    var to = new Date(from).set({day:from.getDaysInMonth(), hour: 23, minute: 59});

    return orm.client.findOne({
        where:{
            id: clientId
        },
        include:[{
            model: orm.job,
            where:{
                timeBooked:{
                    gt: from,
                    lt: to
                },
                state: state
            }
        }],
        order: "timeBooked ASC"
    });
}

function updateJobList(jobs, updateList) {
    var idList = [];
    if(jobs.length > 0){
        jobs.forEach(function(job){
            idList.push(job.id);
        });
    }

    return orm.job.update(updateList, {
        where: {
            id: {$in: idList}
        }
    });
}

function DoneJobList(jobs, invoiceId) {
    return updateJobList(jobs, {state: "Done", invoiceId: null});
}

function InvoiceJobList(jobs, invoiceId) {
    return updateJobList(jobs, {state: "Invoiced", invoiceId: invoiceId});
}

function PaidJobList(jobs) {
    return updateJobList(jobs, {state: "Paid"});
}

// //
// register.updateAllInvoices = function() {
//     return orm.invoice.findAll().then(function(query) {
//         var data =  [];
//         for (var i = 0; i < query.length; i++) {
//             data.push(query[i].get({plain:true}));
//         }
//         return data;
//     }).then(function(data){
//         return Promise.resolve(0).then(function loop(i){
//             if(i < data.length){
//                 return updateOldPromiseHelper(i, data).then(function(){
//                     i++;
//                     return loop(i);
//                 });
//             }
//         });
//     });
// };
//
// function updateOldPromiseHelper(i, data) {
//     return new Promise(function(resolve){
//         return register.invoicePaid(data[i].id).then(function(){
//             resolve();
//         });
//     });
// }

// //Generate previous invoices
// register.generateOldInvoices = function(){
//     var until = Date.today();
//     var from  = Date.today().set({year: 2013, month: 2});
//     return Promise.resolve(from).then(function loop(date){
//         if(date < until) {
//             return generateOldPromiseHelper(parseInt(date.toString("yyyy")), parseInt(date.toString("M"))).then(function(){
//                 date.add(1).month();
//                 return loop(date);
//             });
//         }
//     });
// };
//
// function generateOldPromiseHelper(year, month) {
//     return new Promise(function(resolve){
//         return generateAllInvoices(year, month).then(function(){
//             resolve();
//         });
//     });
// }

module.exports = function getRegister(){
    return require('../scripts/orm.js')().then(function(data){
        orm = data;
        return register;
    });
};
