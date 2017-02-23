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
    return register.findInvoices(false);
};

register.findInvoices = function(paid){
    return orm.invoice.findAll({
        where:{
            paid: paid
        },
        include:[orm.job, orm.client]
    }).then(function(data){
        var invoices = [];
        data.forEach(function(invoice){
            invoices.push(invoice.get({plain:true}));
        });
        return invoices;
    });
};

register.createInvoice = function(year, month, clientId) {
    getJobs(year, month, clientId, "Done").then(function(client) {
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
                        return generateInvoice(data.id);
                    });
                });
            }
        }
    });
};

register.printInvoice = function(invoiceId){
    return generateInvoice(invoiceId);
};

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
    jobs.forEach(function(job){
        idList.push(job.id);
    });

    return orm.job.update(updateList, {
        where: {
            id: {$in: idList}
        }
    });
}

function InvoiceJobList(jobs, invoiceId) {
    return updateJobList(jobs, {state: "Invoiced", invoiceId: invoiceId});
}

function PaidJobList(jobs, invoiceId) {
    return updateJobList(jobs, {state: "Paid"});
}

function generateInvoice(invoiceId) {
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
            fs.writeFileSync(path.resolve("./app/Misc/"+period.toString("yyyy")+"/"+period.toString("MMMM")+"/", invoice.client.businessName+".docx"), buf);

            return true;
        });
    });
}

module.exports = register;
