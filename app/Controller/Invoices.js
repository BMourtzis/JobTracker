var facade;

var ctrl = { };

ctrl.ctrlName = "Invoices";
ctrl.templateDir = "../Templates/";

//Properties for searching
ctrl.currentPage = 0;
ctrl.searchParams = {};

//var for generateInvoice page;
ctrl.year = 0 ;

ctrl.index = function() {
    ctrl.initiatePage().then(function() {
        ctrl.loadCurrentInvoices();
    });
    
    contentManager.restartLineup(ctrl.ctrlName, "index", ctrl.index.bind(this));
};

ctrl.initiatePage = function() {
    return facade.getAllClients().then(function(query) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/index.html");
        var temp = jsrender.templates(templatePath);
        var html = temp({clients: query});
        $("#content").html(html);

        $('#fromDatepicker').datetimepicker({format: 'DD/MM/YYYY'});
        $('#toDatepicker').datetimepicker({format: 'DD/MM/YYYY'});

        ctrl.currentPage = 0;
    });
};

ctrl.loadCurrentInvoices = function() {
    facade.getCurrentInvoices().then(function(invoices){
        ctrl.searchParams.paid = false;
        ctrl.loadTable(invoices);
    });
};

ctrl.loadTable = function(data) {
    data.currentPage = ctrl.currentPage;
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/table.html");
    var temp = jsrender.templates(templatePath);
    var html = temp(data);
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
        formData.from = Date.parse($("#fromDatepicker :input").val());
    }

    if($("#toDatepicker :input").val() !== ""){
        formData.to = Date.parse($("#toDatepicker :input").val());
    }

    ctrl.searchParams = formData;
    ctrl.currentPage = 0;

    return facade.invoiceSearchOptions(ctrl.searchParams, "", ctrl.currentPage).then(function(data){
        ctrl.loadTable(data);
    });
};

ctrl.gotoPage = function(page) {
    ctrl.currentPage = page;
    facade.invoiceSearchOptions(ctrl.searchParams, "", ctrl.currentPage).then(function(data){
        ctrl.loadTable(data);
    });
};

ctrl.getCreateInvoice = function() {
    facade.getAllClients().then(function(query) {
        ctrl.year = parseInt(new Date.today().toString("yyyy"));

        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/create.html");
        var temp = jsrender.templates(templatePath);
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
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/details.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(invoice);
        $("#sidebar").html(html);

        $("#client-job-table.clickable-row").click(function() {
            var id = $(this).data("id");
            UIFunctions.jobDetails(id);
        });
    });
};


ctrl.printInvoice = function(invoiceId) {
    facade.generateInvoice(invoiceId);
};

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

ctrl.invoiceInvoiced = function(invoiceId) {
    facade.invoiceInvoiced(invoiceId).then(function(invoice){
        ctrl.invoiceDetails(invoiceId);
    });
};

module.exports = function getController() {
    return require('../scripts/Facade.js')().then(function(data){
        facade = data;
        return ctrl;
    });
};
