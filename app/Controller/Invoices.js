var facade = require('../scripts/Facade.js');

var ctrl = { };

ctrl.ctrlName = "Invoices";
ctrl.templateDir = "./app/Templates/";

//Properties for searching
ctrl.currentPage = 0;
ctrl.searchParams = {};

//
ctrl.year = 0 ;

ctrl.index = function() {
    facade.getAllClients().then(function(query) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName+'/index.html');
        var html = temp({clients: query});
        $("#content").html(html);

        $('#fromDatepicker').datetimepicker({format: 'DD/MM/YYYY'});
        $('#toDatepicker').datetimepicker({format: 'DD/MM/YYYY'});

        ctrl.loadCurrentInvoices();
    });
};

ctrl.loadCurrentInvoices = function() {
    facade.getCurrentInvoices().then(function(invoices){
        ctrl.loadTable(invoices);
    });
};

//TODO: add pagination
//TODO: save searchParams and currentPage
ctrl.loadTable = function(invoices) {
    var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName+'/table.html');
    var html = temp({invoices: invoices});
    $("#indexInvoiceTable").html(html);

    $("#invoice-table.clickable-row").click(function() {
        var id = $(this).data("id");
        ctrl.invoiceDetails(id);
    });
};

ctrl.searchOptions = function() {
    var formData = $("#searchOptionsForm").serializeArray().reduce(function(obj, item) {
            obj[item.name] = item.value;
            return obj;
        },{});

    if(formData.paid === "paid"){
        formData.paid = true;
    }
    else if(formData.paid === "unpaid"){
        formData.paid = false;
    }

    if($("#fromDatepicker :input").val() !== ""){
        formData.from =  Date.parse($("#fromDatepicker :input").val());
    }

    if($("#toDatepicker :input").val() !== ""){
        formData.to =  Date.parse($("#toDatepicker :input").val());
    }

    return facade.invoiceSearchOptions(formData).then(function(data){
        ctrl.loadTable(data);
    });
};

ctrl.getCreateInvoice = function() {
    facade.getAllClients().then(function(query) {
        ctrl.year = parseInt(new Date.today().toString("yyyy"));
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName+'/create.html');
        var html = temp({clients: query, year: ctrl.year});
        $("#sidebar").html(html);
    });
};

ctrl.addYear = function() {
    ctrl.year++;
    $("#yearCounter").val(ctrl.year);
};

ctrl.subtractYear = function() {
    ctrl.year--;
    $("#yearCounter").val(ctrl.year);
};

ctrl.createInvoice = function() {
    var formData = $("#createInvoiceForm").serializeArray();
    formData[0].value = parseInt(formData[0].value);
    formData[1].value = ctrl.year;
    formData[2].value = parseInt(formData[2].value);
    facade.createInvoice(formData[0].value, formData[1].value, formData[2].value).then(function(data) {
        ctrl.index();
    });
};


ctrl.invoiceDetails = function(id) {
    facade.getInvoice(id).then(function(invoice){
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName+'/details.html');
        var html = temp(invoice);
        $("#sidebar").html(html);

        $("#client-job-table.clickable-row").click(function() {
            var id = $(this).data("id");
            UIFunctions.jobDetails(id);
        });
    });
};

//TODO: Options for invoice generation
ctrl.generateInvoice = function(invoiceId) {
    facade.generateInvoice(invoiceId);
};

ctrl.printInvoice = function(id) {

};

//TODO: add delete confirmation for all delete functionality
ctrl.deleteInvoice = function(invoiceId) {
    facade.deleteInvoice(invoiceId).then(function(data){
        $("#sidebar").html(" ");
        ctrl.index();
    });
};

ctrl.invoicePaid = function(invoiceId) {
    facade.invoicePaid(invoiceId).then(function(invoice){
        ctrl.invoiceDetails(invoiceId);
    });
};

module.exports = ctrl;
