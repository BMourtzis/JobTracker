var facade;

var ctrl = {};

ctrl.ctrlName = "Jobs";
ctrl.templateDir = "../Templates/";

//Properties for searching
ctrl.currentPage = 0;
ctrl.searchParams = {};

//Properties for selection
ctrl.selectedList = [];

//TODO: Add ordering

/**
 * ctrl.index - Creates the index page for Jobs and loads all the jobs
 *
 * @return {Promise}  an empty promise
 */

ctrl.index = function() {
    contentManager.restartLineup(ctrl.ctrlName, "index", ctrl.index.bind(this));
    return initiatePage().then(function() {
        return loadAllJobs();
    });
};

/**
 * initiatePage - Adds the heading, buttons and the modal
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

        $("#jobAllCheckbox").click(function() {
            updateAllCheckboxes();
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
 * ctrl.getClientJobs - Queries all the jobs based on the client id
 *
 * @param  {number} clientId the id of the clint
 * @return {Promise}          an empty promise
 */

ctrl.getClientJobs = function(clientId) {
    contentManager.add(ctrl.ctrlName, "reload", reload.bind(this));
    return initiatePage().then(function() {
        ctrl.searchParams = {
            clientID: clientId
        };
        return facade.getClientJobs(ctrl.searchParams, "", ctrl.currentPage).then(function(data) {
            return loadTable(data);
        });
    });
};

/**
 * loadAllJobs - Loads all Jobs
 *
 * @return {promise}  an empty promise
 */

function loadAllJobs() {
    ctrl.searchParams = {
        from: Date.today().last().year().set({
            month: 0,
            day: 1
        }),
        to: Date.today().set({
            month: 11,
            day: 31
        }).at({
            hour: 23,
            minute: 59
        })
    };
    facade.searchJobs(ctrl.searchParams, "", ctrl.currentPage).then(function(query) {
        loadTable(query);
    });
}

/**
 * search - Searches for the Jobs with the given parameters
 *
 * @return {Promise}  an empty promise
 */

function search() {
    ctrl.currentPage = 0;

    var formData = $("#searchOptionsForm").serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
    }, {});

    if ($('#fromDatepicker :input').val() !== "") {
        formData.from = Date.parse($('#fromDatepicker :input').val());
    }

    if ($('#toDatepicker :input').val() !== "") {
        formData.to = Date.parse($('#toDatepicker :input').val());
    }

    contentManager.add(ctrl.ctrlName, "search", search.bind(this));

    ctrl.searchParams = formData;
    return facade.searchJobs(ctrl.searchParams, "", ctrl.currentPage).then(function(data) {
        loadTable(data);
    });
}

/**
 * reload - Reloads the table with the same search parameters
 *
 * @return {Promise}  an empty promise
 */
function reload() {
    return facade.searchJobs(ctrl.searchParams, "", ctrl.currentPage).then(function(data) {
        return loadTable(data);
    });
}

/**
 * updateSelectedList - Updates the list of selected jobs
 */
function updateSelectedList() {
    var tdList = $("#indexJobTable :checked");
    ctrl.selectedList = [];

    tdList.each(function() {
        ctrl.selectedList.push(parseInt($(this).data("id")));
    });

    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/selectedListOptions.html");
    var temp = jsrender.templates(templatePath);
    var html = temp({
        count: ctrl.selectedList.length
    });
    sidebarManager.add(ctrl.ctrlName, "updateSelectedList", updateSelectedList.bind(this));
    $("#sidebar-heading").html("Selection List");
    $("#sidebar").html(html);

    $("#delete-button").click(function() {
        bulkDelete();
    });
}

/**
 * updateAllCheckboxes - Updates all the checkboxes depending on the top one, and then updates the list
 *
 * @return {Promise}  an empty promise
 */
function updateAllCheckboxes() {
    var checked = $("#jobAllCheckbox").is(":checked");
    var tdList = $("#indexJobTable :checkbox");

    tdList.each(function() {
        $(this).prop("checked", checked);
    });

    updateSelectedList();
}

/**
 * gotoPage - Loads the next page of the table
 *
 * @param  {number} page the page number
 * @return {Position}      an empty promise
 */

function gotoPage(page) {
    if (page !== undefined) {
        ctrl.currentPage = page;
        return reload();
    }
}

/**
 * loadTable - Generates the table with the data given
 *
 * @param  {Object} data A list of data to be loaded on the table
 */

function loadTable(data) {
    data.currentPage = ctrl.currentPage;

    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/table.html");
    var tableTemp = jsrender.templates(templatePath);
    var table = tableTemp(data);
    $("#indexJobTable").html(table);

    $(".job-checkbox").click(function() {
        updateSelectedList();
    });
    $(".details-button").click(function() {
        ctrl.details($(this).data("id"));
    });
    $("#paginationNavBar li").click(function() {
        gotoPage($(this).data("page"));
    });
}

/**
 * ctrl.details - Gets the client details and loads them on the sidebar
 *
 * @param  {number} id the id of the job
 * @return {Promise}    an empty promise
 */

ctrl.details = function(id) {
    sidebarManager.add(ctrl.ctrlName, "details", ctrl.details.bind(this), id);
    return facade.getJobFull(id).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/details.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);
        $("#sidebar-heading").html("Job Details");
        $("#sidebar").html(html);

        $("#done-button").click(function() {
            done(id);
        });
        $("#placed-button").click(function() {
            placed(id);
        });
        $("#rebook-button").click(function() {
            ctrl.rebook(id);
        });
        $("#edit-button").click(function() {
            ctrl.edit(id);
        });
        $("#delete-button").click(function() {
            new Promise(function(resolve, reject) {
                $("#deleteConfirmationModal").on('hidden.bs.modal', function(e) {
                    resolve();
                });
            }).then(function() {
                remove(data.id);
            });
        });
    });
};

/**
 * ctrl.create - Creates the createJob page
 *
 * @param  {number} id optional,if id exists it will load the client, if not it will load all clients
 * @return {Promise}    an empty promise
 */

ctrl.create = function(id) {
    if (id === undefined) {
        return facade.getAllClients().then(function(query) {
            return fillCreatePage({
                clients: query
            });
        });
    } else {
        return facade.getClient(id).then(function(query) {
            return fillCreatePage({
                client: query
            });
        });
    }
};

/**
 * fillCreatePage - Create the create page based on the data given
 *
 * @param  {Object} data a list of clients to be loaded to the page
 */

function fillCreatePage(data) {
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/create.html");
    var temp = jsrender.templates(templatePath);
    var html = temp(data);

    sidebarManager.add(ctrl.ctrlName, "create", ctrl.create.bind(this));
    $("#sidebar-heading").html("Create Job");
    $("#sidebar").html(html);

    $('#datepicker').datetimepicker({
        format: 'DD/MM/YYYY'
    });
    $('#timepicker').datetimepicker({
        format: 'HH:mm'
    });

    $("#form-submit-button").click(function() {
        create();
    });
}

/**
 * create - Creates a new job based on the fields
 *
 * @return {Promise}  an empty promise
 */

function create() {
    var formData = $("#createJobForm").serializeArray();
    var date = $('#datepicker :input').val();
    var time = $('#timepicker :input').val();
    var dateTimeFormat = "DD/MM/YYYY HH:mm";

    formData.push(moment(date + " " + time, dateTimeFormat)._d);
    return facade.createJob(formData[1].value, formData[3], formData[2].value, formData[0].value).then(function(job) {
        sidebarManager.pop();
        contentManager.reload();
        return ctrl.details(job.id);
    });
}

/**
 * remove - Deletes the selected Job
 *
 * @param  {number} id the id of the job
 */

function remove(id) {
    return facade.removeJob(id).then(function() {
        contentManager.reload();
        sidebarManager.goBack();
    });
}

/**
 * bulkDelete - It deletes a number of jobs
 *
 * @return {Promise}  an empty promise
 */
function bulkDelete() {
    return facade.bulkDeleteJobs(ctrl.selectedList).then(function() {
        contentManager.reload().then(function() {
            return updateSelectedList();
        });
    });
}

/**
 * ctrl.edit - Creates the edit details page
 *
 * @param  {number} id the id fo the job
 * @return {Promise}    an empty promise
 */
ctrl.edit = function(id) {
    facade.getJob(id).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/edit.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);

        sidebarManager.add(ctrl.ctrlName, "edit", ctrl.edit.bind(this), id);
        $("#sidebar-heading").html("Edit Job");
        $("#sidebar").html(html);

        $("#save-edit-button").click(function() {
            edit(id);
        });
    });
};

/**
 * edit - Updates the details of the job based on the edits made
 *
 * @param  {number} id the id of the job
 * @return {Promise}    an empty promise
 */
function edit(id) {
    var formData = $("#editJobForm").serializeArray();
    formData[1].value = parseFloat(formData[1].value);
    return facade.editJob(id, formData).then(function() {
        sidebarManager.pop();
        contentManager.reload();
        return ctrl.details(id);
    });
}

/**
 * ctrl.rebook - Creates the Rebook job page
 *
 * @param  {number} id the id of the job
 * @return {Promise}    an empty promise
 */
ctrl.rebook = function(id) {
    return facade.getJob(id).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/rebook.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);

        sidebarManager.add(ctrl.ctrlName, "rebook", ctrl.rebook.bind(this), id);
        $("#sidebar-heading").html("Rebook Job");
        $("#sidebar").html(html);

        $('#datepicker').datetimepicker({
            format: 'DD/MM/YYYY'
        });
        $('#timepicker').datetimepicker({
            format: 'HH:mm'
        });

        $("#save-rebook-button").click(function() {
            rebook(id);
        });
    });
};

/**
 * rebook - Rebooks a job
 *
 * @param  {number} id the id of the job
 * @return {Promise}    an empty promise
 */
function rebook(id) {
    var formData = [];
    var date = $('#datepicker :input').val();
    var time = $('#timepicker :input').val();
    var dateTimeFormat = "DD/MM/YYYY HH:mm";

    formData.push({
        name: "timeBooked",
        value: moment(date + " " + time, dateTimeFormat)._d
    });

    return facade.editJob(id, formData).then(function() {
        sidebarManager.pop();
        contentManager.reload();
        return ctrl.details(id);
    });
}

//State Machine

/**
 * placed - changes the state of the job to Placed
 *
 * @param  {number} id the id of the job
 * @return {Promise}    an empty promise
 */

function placed(id) {
    return facade.placed(id).then(function(data) {
        return ctrl.details(id);
    });
}

/**
 * done - changes the state of the job to Done
 *
 * @param  {number} id the id of the job
 * @return {Promise}    an empty promise
 */
function done(id) {
    return facade.done(id).then(function(data) {
        return ctrl.details(id);
    });
}

/**
 * initiateController - Initiates the controller
 *
 * @return {Object}  Jobs controller
 */
function initiateController() {
    return require('../scripts/Facade.js').then(function(data) {
        facade = data;
        return ctrl;
    });
}

module.exports = initiateController();
