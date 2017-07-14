var facade;

var ctrl = {};

ctrl.ctrlName = "Invoices";
ctrl.templateDir = "../Templates/";

//Properties for searching
ctrl.currentPage = 0;
ctrl.searchParams = {};

//var for generateInvoice page;
ctrl.year = 0;


/**
 * ctrl.index - calls the initiatePage for Invoices and then loads the pending invoices
 *
 * @return {Promise}  an empty promise
 */
ctrl.index = function() {
    contentManager.restartLineup(ctrl.ctrlName, "index", ctrl.index.bind(this));
    return initiatePage().then(function() {
        return loadPendingInvoices();
    });
};

/**
 * initiatePage - Iniates the index page for invoices
 *
 * @return {Promise}  an empty promise
 */
function initiatePage() {
    return facade.getAllClients().then(function(query) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/index.html");
        var temp = jsrender.templates(templatePath);
        var html = temp({
            clients: query
        });
        $("#content").html(html);

        $('#fromDatepicker').datetimepicker({
            format: 'DD/MM/YYYY'
        });
        $('#toDatepicker').datetimepicker({
            format: 'DD/MM/YYYY',
            useCurrent: false
        });

        $('#fromDatepicker').on("dp.change", function(e) {
            $('#toDatepicker').data("DateTimePicker").minDate(e.date);
        });

        $('#toDatepicker').on("dp.change", function(e) {
            $('#fromDatepicker').data("DateTimePicker").maxDate(e.date);
        });

        $("#create-button").click(function() {
            ctrl.create();
        });
        $("#search-button").click(function() {
            search();
        });

        ctrl.currentPage = 0;
    });
}

/**
 * loadPendingInvoices - Loads the unpaid invoices
 *
 * @return {Promise}  an empty promise
 */
function loadPendingInvoices() {
    return facade.getCurrentInvoices().then(function(invoices) {
        ctrl.searchParams.paid = false;
        return loadTable(invoices);
    });
}

/**
 * loadTable - Loads the table in content delete-invoice-button
 *
 * @param  {Object} data The list of invoices to be loads on the table
 */
function loadTable(data) {
    for(var i = 0; i < data.invoices.length; i++) {
        data.invoices[i].total = numberFormatter(data.invoices[i].total).format();
    }

    data.currentPage = ctrl.currentPage;
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/table.html");
    var temp = jsrender.templates(templatePath);
    var html = temp(data);
    $("#indexInvoiceTable").html(html);

    $("#invoice-table button").click(function() {
        ctrl.details($(this).data("id"));
    });
    $("#paginationNavBar li").click(function() {
        gotoPage($(this).data("page"));
    });
}

/**
 * search - Gets the search parameters from the fields, searches for them and then calls loads table
 *
 * @return {Promise}  an emtpy promise
 */
function search() {
    var formData = $("#searchOptionsForm").serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
    }, {});

    if (formData.paid === "paid") {
        formData.paid = true;
    } else if (formData.paid === "unpaid") {
        formData.paid = false;
    }

    if ($("#fromDatepicker :input").val() !== "") {
        formData.from = Date.parse($("#fromDatepicker :input").val());
    }

    if ($("#toDatepicker :input").val() !== "") {
        formData.to = Date.parse($("#toDatepicker :input").val());
    }

    ctrl.searchParams = formData;
    ctrl.currentPage = 0;

    contentManager.add(ctrl.ctrlName, "search", reload.bind(this));

    return facade.invoiceSearchOptions(ctrl.searchParams, "", ctrl.currentPage).then(function(data) {
        return loadTable(data);
    });

}

/**
 * ctrl.getClientInvoices - Usually called from another controller. It fetches the invoices based on the client and loads them on the invoice content page
 *
 * @param  {number} clientId the id of the client
 * @return {Promise}          an empty promise
 */
ctrl.getClientInvoices = function(clientId) {
    contentManager.add(ctrl.ctrlName, "reload", reload.bind(this));
    ctrl.searchParams = {
        clientID: clientId
    };
    initiatePage();
    return facade.invoiceSearchOptions(ctrl.searchParams, "", ctrl.currentPage).then(function(data) {
        loadTable(data);
    });
};

/**
 * reload - reloads the content page with the same search params
 *
 * @return {Promise}  an empty promise
 */
function reload() {
    return facade.invoiceSearchOptions(ctrl.searchParams, "", ctrl.currentPage).then(function(data) {
        return loadTable(data);
    });
}

/**
 * gotoPage - changes page to the specified one
 *
 * @param  {number} page the number of the page starting from 0
 * @return {Promise}      an empty promise
 */
function gotoPage(page) {
    if (page !== undefined) {
        ctrl.currentPage = page;
        return facade.invoiceSearchOptions(ctrl.searchParams, "", ctrl.currentPage).then(function(data) {
            return loadTable(data);
        });
    }
}

/**
 * ctrl - Creates the createInvoice page based on the id given
 *
 * @param  {number} id the id of the client, if empty is loads all the clients
 * @return {Promise}    an empty promise
 */

ctrl.create = function(id) {
    ctrl.year = parseInt(new Date.today().toString("yyyy"));

    if (id === undefined) {
        return facade.getAllClients().then(function(query) {
            return fillCreatePage({
                clients: query,
                year: ctrl.year
            });
        });
    } else {
        return facade.getClient(id).then(function(query) {
            return fillCreatePage({
                client: query,
                year: ctrl.year
            });
        });
    }
};

/**
 * fillCreatePage - Create the create page based on the data given
 *
 * @param  {Object} data an Object of the data to be rendered, it should have a list of clients or just one client
 */
function fillCreatePage(data) {
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/create.html");
    var temp = jsrender.templates(templatePath);
    var html = temp(data);

    sidebarManager.add(ctrl.ctrlName, "create", ctrl.create.bind(this));
    $("#sidebar-heading").html("Create Invoice");
    $("#sidebar").html(html);

    $("#subtractYearCounter").click(function() {
        subtractYear();
    });
    $("#addYearCounter").click(function() {
        addYear();
    });
    $("#generate-invoice").click(function() {
        create();
    });
}

/**
 * addYear - +1 to the year field and updates it on the page
 */
function addYear() {
    ctrl.year++;
    $("#yearCounter").val(ctrl.year);
}

/**
 * subtractYear - -1 to the year field and updates it on the page
 */
function subtractYear() {
    ctrl.year--;
    $("#yearCounter").val(ctrl.year);
}

/**
 * create - Creates the Invoice by taking the parameters from the form
 *
 * @return {type}  description
 */
function create() {
    var formData = $("#createInvoiceForm").serializeArray();
    formData[0].value = parseInt(formData[0].value);
    formData[1].value = ctrl.year;
    formData[2].value = parseInt(formData[2].value);
    return facade.createInvoice(formData[0].value, formData[1].value, formData[2].value).then(function(data) {
        $.notify({
            //options
            message: "Invoice(s) successfully generated"
        }, {
            //settings
            type: "success",
            delay: 3000
        });

        sidebarManager.pop();
        if (formData[0].value !== 0) {
            ctrl.details(data);
        } else {
            sidebarManager.removeHtml();
        }
        contentManager.reload();
    });
}

/**
 * ctrl.details - loads the detail of the invoice specified
 *
 * @param  {number} id the id of the invoice
 * @return {Promise}    an empty promise
 */
ctrl.details = function(id) {
    sidebarManager.add(ctrl.ctrlName, "details", ctrl.details.bind(this), id);
    return facade.getInvoice(id).then(function(invoice) {

        for(var i = 0; i < invoice.jobs.length; i++) {
            invoice.jobs[i].total = numberFormatter(invoice.jobs[i].payment + invoice.jobs[i].gst).format();
        }

        invoice.total = numberFormatter(invoice.total).format();

        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/details.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(invoice);
        $("#sidebar-heading").html("Invoice Details");
        $("#sidebar").html(html);

        $("#client-job-table .clickable-row").click(function() {
            var id = $(this).data("id");
            ctrls.Jobs.details(id);
        });

        $("#paid-button").click(function() {
            paid(id);
        });
        $("#cancel-button").click(function() {
            invoiced(id);
        });
        $("#print-button").click(function() {
            print(id);
        });
        $("#delete-invoice-button").click(function() {
            new Promise(function(resolve, reject) {
                $("#deleteConfirmationModal").on('hidden.bs.modal', function(e) {
                    resolve();
                });
            }).then(function() {
                remove(id);
            });
        });
    });
};

/**
 * print - Prints the invoice on a docx again
 *
 * @param  {number} invoiceId the id of the Invoice
 * @return {Promise}           an empty promise
 */
function print(invoiceId) {
    return facade.printInvoice(invoiceId).then(function() {
        $.notify({
            //options
            message: "Invoice successfully printed"
        }, {
            //settings
            type: "success",
            delay: 3000
        });
    });
}

/**
 * remove - Removes the invoice specified
 *
 * @param  {number} invoiceId the id of the invoice
 * @return {Promise}           an empty promise
 */
function remove(invoiceId) {
    return facade.deleteInvoice(invoiceId).then(function(data) {
        sidebarManager.removeHtml();
        contentManager.reload();
    });
}

/**
 * paid - Changes the state of the invoice to Paid
 *
 * @param  {number} invoiceId the id of the invoice
 * @return {Promise}           an empty promise
 */
function paid(invoiceId) {
    return facade.invoicePaid(invoiceId).then(function(invoice) {
        ctrl.details(invoiceId);
        contentManager.reload();
    });
}

/**
 * invoiced - Changes the state of the invoice to Invoiced
 *
 * @param  {number} invoiceId the id of the invoice
 * @return {Promise}           an empty promise
 */
function invoiced(invoiceId) {
    return facade.invoiceInvoiced(invoiceId).then(function(invoice) {
        ctrl.details(invoiceId);
        contentManager.reload();
    });
}

/**
 * initiateController - Initiates the controller
 *
 * @return {Object}  the Invoice controller
 */
function initiateController(injFacade) {
    facade = injFacade;
    return ctrl;
}

module.exports = initiateController;
