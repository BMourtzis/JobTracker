var facade = require('../scripts/Facade.js');

var ctrl = { };

ctrl.ctrlName = "Invoices";
ctrl.templateDir = "./app/Templates/";

//TODO: add invoice table
ctrl.index = function() {
    facade.getAllClients().then(function(query) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName+'/index.html');
        var html = temp({clients: query});
        $("#content").html(html);

        ctrl.loadCurrentInvoices();
    });

};

ctrl.loadCurrentInvoices = function() {
    facade.getCurrentInvoices().then(function(invoices){
        ctrl.loadTable(invoices);
    });
};

ctrl.loadTable = function(invoices) {
    var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName+'/table.html');
    var html = temp({invoices: invoices});
    $("#indexInvoiceTable").html(html);
};

//TODO: Options for invoice generation
ctrl.getGenerateSidebar = function() {

};

module.exports = ctrl;
