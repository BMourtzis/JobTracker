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
    return findInvoices(generateQuery({paid: false}));
};

register.invoiceSearchOptions = function(searchParams) {
    return findInvoices(generateQuery(searchParams));
};

register.invoiceGeneration = function(id, year, month) {
    if(id === 0){
        return generateAllInvoices(year, month);
    }
    else {
        return register.createInvoice(year, month, id);
    }
};

function generateAllInvoices(year, month) {
    return orm.client.findAll().then(function(data){
        var returns = [];
        data.forEach(function(client){
            var clientData = client.get({plain:true});
            returns.push(register.createInvoice(year, month, clientData.id));
        });
    });
}

register.createInvoice = function(year, month, clientId) {
    return getJobs(year, month, clientId, "Done").then(function(client) {
        if(client){
            var clientData = client.get({plain: true});
            var sum = 0;
            clientData.jobs.forEach(function(job) {
                sum += job.payment + job.gst;
            });
            var date = new Date.today().set({year: year, month: month-1, day: 1});
            var invoiceNo = clientData.shortName + date.toString("yy") + date.toString("MM");

            if(client.jobs.length > 0) {
                client.addNewInvoice(year, month, sum, invoiceNo).then(function(data) {
                    InvoiceJobList(clientData.jobs, data.id).then(function(smth){
                        return register.generateInvoice(data.id);
                    });
                });
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
        PaidJobList(data.jobs).then(function(){
            return data;
        });
    });
};

//TODO: add directory creation
//TODO: fix the next service bug
register.generateInvoice = function(invoiceId) {
    //dependencies
    var JSZip = require('jszip');
    var docxtemplater = require('docxtemplater');

    var content = fs.readFileSync(path.resolve("./app/Misc/", "Receipt_Template.docx"), "binary");
    var zip = new JSZip(content);
    var doc = new docxtemplater();
    doc.loadZip(zip);

    register.getInvoice(invoiceId).then(function(invoice){
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


        // TODO: Test if this works fine
        getJobs(invoice.year, invoice.month+1, invoice.client.id, "Placed").then(function(data){
            if(data){
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
            // +period.toString("yyyy")+"/"+period.toString("MMMM")+"/"
            fs.writeFileSync(path.resolve("./app/Misc/", invoice.client.businessName+".docx"), buf);

            return true;
        });
    });
};

register.deleteInvoice = function(invoiceId) {
    return orm.invoice.findById(invoiceId, {include:[orm.client, orm.job]}).then(function(invoice){
        var invoiceData = invoice.get({plain:true});
        console.log(invoiceData);
        return DoneJobList(invoiceData.jobs, invoiceId).then(function(){
            return invoice.destroy();
        });
    });

};

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

    return query;
}

function findInvoices(searchParams){
    return orm.invoice.findAll({
        where: searchParams,
        include:[orm.client]
    }).then(function(data){
        var invoices = [];
        data.forEach(function(invoice){
            invoices.push(invoice.get({plain:true}));
        });
        return invoices;
    });
}

function getJobs(year, month, clientId, state) {
    var from = new Date.today().set({year: year, month: month-1, day: 1});
    var to = new Date(from).set({day:from.getDaysInMonth(), hour: 23, minute: 59});

    return orm.client.findOne({
        id: clientId,
        include:[{
            model: orm.job,
            where:{
                timeBooked:{
                    gt: from,
                    lt: to
                },
                state: state
            }
        }]
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

module.exports = register;
