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
    initiatePage().then(function() {
        loadCurrentInvoices();
    });

    contentManager.restartLineup(ctrl.ctrlName, "index", ctrl.index.bind(this));
};

function initiatePage() {
    return facade.getAllClients().then(function(query) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/index.html");
        var temp = jsrender.templates(templatePath);
        var html = temp({clients: query});
        $("#content").html(html);

        $('#fromDatepicker').datetimepicker({format: 'DD/MM/YYYY'});
        $('#toDatepicker').datetimepicker({
            format: 'DD/MM/YYYY',
            useCurrent: false
        });

        $('#fromDatepicker').on("dp.change", function(e){
            $('#toDatepicker').data("DateTimePicker").minDate(e.date);
        });

        $('#toDatepicker').on("dp.change", function(e){
            $('#fromDatepicker').data("DateTimePicker").maxDate(e.date);
        });

        $("#create-button").click(function(){ctrl.create();});
        $("#search-button").click(function(){search();});

        ctrl.currentPage = 0;
    });
}

function loadCurrentInvoices() {
    return facade.getCurrentInvoices().then(function(invoices){
        ctrl.searchParams.paid = false;
        loadTable(invoices);
    });
}

function loadTable(data) {
    data.currentPage = ctrl.currentPage;
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/table.html");
    var temp = jsrender.templates(templatePath);
    var html = temp(data);
    $("#indexInvoiceTable").html(html);

    $("#invoice-table button").click(function(){ctrl.details($(this).data("id"));});
    $("#paginationNavBar li").click(function(){gotoPage($(this).data("page"));});
}

function search() {
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

    contentManager.add(ctrl.ctrlName, "search", reload.bind(this));

    return facade.invoiceSearchOptions(ctrl.searchParams, "", ctrl.currentPage).then(function(data){
        loadTable(data);
    });

}

ctrl.getClientInvoices = function(clientId){
    contentManager.add(ctrl.ctrlName, "reload", reload.bind(this));
    ctrl.searchParams = {clientID: clientId};
    initiatePage();
    return facade.invoiceSearchOptions(ctrl.searchParams, "", ctrl.currentPage).then(function(data){
        loadTable(data);
    });
};

function reload() {
    return facade.invoiceSearchOptions(ctrl.searchParams, "", ctrl.currentPage).then(function(data){
        loadTable(data);
    });
}

function gotoPage(page) {
    if(page !== undefined) {
        ctrl.currentPage = page;
        return facade.invoiceSearchOptions(ctrl.searchParams, "", ctrl.currentPage).then(function(data){
            loadTable(data);
        });
    }
}
//
// ctrl.create = function() {
//     facade.getAllClients().then(function(query) {
//         ctrl.year = parseInt(new Date.today().toString("yyyy"));
//
//         var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/create.html");
//         var temp = jsrender.templates(templatePath);
//         var html = temp({clients: query, year: ctrl.year});
//
//         sidebarManager.add(ctrl.ctrlName, "create", ctrl.create.bind(this));
//         $("#sidebar-heading").html("Create Invoice");
//         $("#sidebar").html(html);
//
//         $("#subtractYearCounter").click(function(){subtractYear();});
//         $("#addYearCounter").click(function() {addYear();});
//         $("#generate-invoice").click(function(){create();});
//     });
// };

//Creates the createInvoice page
ctrl.create = function(id) {
    ctrl.year = parseInt(new Date.today().toString("yyyy"));

    if(id === undefined) {
        return facade.getAllClients().then(function(query) {
            return fillCreatePage({clients: query, year: ctrl.year});
        });
    }
    else {
        return facade.getClient(id).then(function(query) {
            return fillCreatePage({client: query, year: ctrl.year});
        });
    }
};

//Create the create page based on the data given
function fillCreatePage(data) {
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/create.html");
    var temp = jsrender.templates(templatePath);
    var html = temp(data);

    sidebarManager.add(ctrl.ctrlName, "create", ctrl.create.bind(this));
    $("#sidebar-heading").html("Create Invoice");
    $("#sidebar").html(html);

    $("#subtractYearCounter").click(function(){subtractYear();});
    $("#addYearCounter").click(function() {addYear();});
    $("#generate-invoice").click(function(){create();});
}

function addYear() {
    ctrl.year++;
    $("#yearCounter").val(ctrl.year);
}

function subtractYear() {
    ctrl.year--;
    $("#yearCounter").val(ctrl.year);
}

function create() {
    var formData = $("#createInvoiceForm").serializeArray();
    formData[0].value = parseInt(formData[0].value);
    formData[1].value = ctrl.year;
    formData[2].value = parseInt(formData[2].value);
    facade.createInvoice(formData[0].value, formData[1].value, formData[2].value).then(function(data) {
        $.notify({
            //options
            message: "Invoice(s) successfully generated"
        },{
            //settings
            type: "success",
            delay: 3000
        });

        sidebarManager.pop();
        if(formData[0].value !== 0) {
            ctrl.invoiceDetails(data);
        }
        else {
            sidebarManager.removeHtml();
        }
        contentManager.reload();
    });
}


ctrl.details = function(id) {
    facade.getInvoice(id).then(function(invoice){
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/details.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(invoice);
        $("#sidebar-heading").html("Invoice Details");
        $("#sidebar").html(html);

        $("#client-job-table .clickable-row").click(function() {
            var id = $(this).data("id");
            ctrls.Jobs.details(id);
        });

        $("#paid-button").click(function(){paid(id);});
        $("#cancel-button").click(function(){invoiced(id);});
        $("#print-button").click(function(){print(id);});
        $("#delete-invoice-button").click(function(){
            new Promise(function(resolve, reject){
                $("#deleteConfirmationModal").on('hidden.bs.modal', function (e) {
                    resolve();
                });
            }).then(function(){
                remove(id);
            });
        });
    });
    sidebarManager.add(ctrl.ctrlName, "details", ctrl.details.bind(this), id);
};


function print(invoiceId) {
    facade.generateInvoice(invoiceId).then(function(){
        $.notify({
            //options
            message: "Invoice successfully printed"
        },{
            //settings
            type: "success",
            delay: 3000
        });
    });
}

function remove(invoiceId) {
    return facade.deleteInvoice(invoiceId).then(function(data){
        sidebarManager.removeHtml();
        contentManager.reload();
    });
}

function paid(invoiceId) {
    return facade.invoicePaid(invoiceId).then(function(invoice){
        ctrl.details(invoiceId);
        contentManager.reload();
    });
}

function invoiced(invoiceId) {
    return facade.invoiceInvoiced(invoiceId).then(function(invoice){
        ctrl.details(invoiceId);
        contentManager.reload();
    });
}

module.exports = function getController() {
    return require('../scripts/Facade.js')().then(function(data){
        facade = data;
        return ctrl;
    });
};
