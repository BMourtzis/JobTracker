var gen = {};

var JSZip = require('jszip');
var docxtemplater = require('docxtemplater');

gen.generatInvoice = function(client, year, month){
    var content = fs.readFileSync(path.resolve("./app/Misc/", "Receipt_Template.docx"), "binary");
    var zip = new JSZip(content);
    var doc = new docxtemplater();
    doc.loadZip(zip);

    client.subtotal = 0;
    for(var i = 0; i< client.jobs.length; i++){
        client.jobs[i].timeBooked = new Date(client.jobs[i].timeBooked).toString("dd/MM/yyyy");
        client.subtotal += client.jobs[i].payment;
    }

    client.gst = client.subtotal*0.1;
    client.total = client.subtotal + client.gst;

    var period = new Date().set({year: year, month: month});
    client.invoiceNo = client.shortName + period.toString("yy") + period.toString("MM");
    client.issueDate = new Date.today().toString("dd-MM-yyyy");
    client.invoicePeriod = period.toString("MMMM yyyy");

    // TODO: Fix the next month problem, send a Date object
    facade.getMonthJobs(client.id, year, month+1).then(function(data){
        var nextServ = [];
        for(var i = 0; i < data.length; i++){
            nextServ.push(new Date(data[i].timeBooked).toString("dd/MM/yyyy"));
        }
        return nextServ;
    })
    .then(function(data){

        client.nextServices = data;

        doc.setData(client);
        doc.render();

        var buf = doc.getZip().generate({type: "nodebuffer"});
        fs.writeFileSync(path.resolve("./app/Misc/", "test.docx"), buf);
    });
};

gen.generateMultipleInvoices = function(clients) {
    for (var client in clients) {
        gen.generateReceipt(client);
    }
};

module.exports = gen;
