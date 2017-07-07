var facade;

var ctrl = {};

ctrl.ctrlName = "JobSchemes";
ctrl.templateDir = "../Templates/";
ctrl.repval = 0;
ctrl.selectedRep = "";

//var for generateJobs page;
ctrl.year = 0;

//Search Options
ctrl.currentPage = 0;
ctrl.searchParams = {};

/**
 * ctrl.index - Add the index page for jobschemes to the content
 *
 * @return {Promise}  an empty promise
 */
ctrl.index = function() {
    contentManager.restartLineup(ctrl.ctrlName, "index", ctrl.index.bind(this));
    return initiatePage().then(function() {
        return loadActiveJobs();
    });
};

/**
 * initiatePage - Initiates the basic content of the index page
 *
 * @return {Prommise}  an empty promise
 */
function initiatePage() {
    return facade.getAllClients().then(function(query) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/index.html");
        var temp = jsrender.templates(templatePath);
        var html = temp({
            clients: query
        });
        $("#content").html(html);

        $("#searchJobSchemesButton").click(function() {
            search();
        });
        $("#generate-button").click(function() {
            ctrl.generate();
        });
        $("#create-button").click(function() {
            ctrl.create();
        });

        $('#fromTimepicker').datetimepicker({
            format: 'HH:mm'
        });
        $('#toTimepicker').datetimepicker({
            format: 'HH:mm',
            useCurrent: false
        });

        $('#fromTimepicker').on("dp.change", function(e) {
            $('#toTimepicker').data("DateTimePicker").minDate(e.date);
        });

        $('#toTimepicker').on("dp.change", function(e) {
            $('#fromTimepicker').data("DateTimePicker").maxDate(e.date);
        });

        ctrl.currentPage = 0;
    });
}

/**
 * loadActiveJobs - Fetches all active (enabled) jobschemes
 *
 * @return {Promise}  an empty promise
 */
function loadActiveJobs() {
    ctrl.searchParams = {
        enabled: true
    };
    return facade.getActiveJobSchemes().then(function(data) {
        return loadTable(data);
    });
}

/**
 * loadTable - Loads a list of jobschemes to the table
 *
 * @param  {Object} data a list of jobschemes
 * @return {Promise}      an empty promise
 */
function loadTable(data) {
    data.currentPage = ctrl.currentPage;

    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/table.html");
    var tableTemp = jsrender.templates(templatePath);
    var table = tableTemp(data);
    $("#JobSchemesTable").html(table);

    $("#paginationNavBar li").click(function() {
        gotoPage($(this).data("id"));
    });
    $("#jobSchemes-table button").click(function() {
        ctrl.details($(this).data("id"));
    });
}

/**
 * search - Gets search parameters from the fields and searches with them
 *
 * @return {Promise}  an empty promise
 */
function search() {
    $("#advSearchModal").modal('hide');
    contentManager.add(ctrl.ctrlName, "search", reload.bind(this));

    var formData = $("#searchOptionsForm").serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
    }, {});

    ctrl.currentPage = 0;
    ctrl.searchParams = formData;
    return facade.searchJobSchemes(ctrl.searchParams, ctrl.currentPage).then(function(data) {
        return loadTable(data);
    });
}

/**
 * ctrl.getClientSchemes - fetches a list of jobschemes that belong to the client
 *
 * @param  {Number} clientId the id of the client
 * @return {Promise}          an empty promise
 */
ctrl.getClientSchemes = function(clientId) {
    contentManager.add(ctrl.ctrlName, "reload", reload.bind(this));
    ctrl.searchParams = {
        client: clientId
    };
    initiatePage();
    return facade.searchJobSchemes(ctrl.searchParams, ctrl.currentPage).then(function(data) {
        return loadTable(data);
    });
};

/**
 * reload - Reloads the table with the same search parameters
 *
 * @return {Promise}  an empty promise
 */
function reload() {
    return facade.searchJobSchemes(ctrl.searchParams, ctrl.currentPage).then(function(data) {
        return loadTable(data);
    });
}

/**
 * gotoPage - changes the page of the table
 *
 * @param  {Number} page the number of the page
 * @return {Promise}      an empty promise
 */
function gotoPage(page) {
    ctrl.currentPage = page;
    return reload();
}

/**
 * ctrl.details - Gets and Displays the jobScheme details on the sidebar
 *
 * @param  {Number} id the id of the jobScheme
 * @return {Promise}    an empty promise
 */
ctrl.details = function(id) {
    sidebarManager.add(ctrl.ctrlName, "details", ctrl.details.bind(this), id);
    ctrl.year = parseInt(new Date.today().toString("yyyy"));
    return facade.getJobSchemeFull(id).then(function(data) {
        data.year = ctrl.year;

        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/details.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);
        $("#sidebar-heading").html("Service Details");
        $("#sidebar").html(html);

        //Adds clicks events on buttons
        $("#edit-button").click(function() {
            ctrl.edit(id);
        });
        $("#generateJobsButton").click(function() {
            generate(id);
        });
        $("#removeJobSchemeButton").click(function() {
            //Wait until modal is dissmissed
            new Promise(function(resolve, reject) {
                $("#deleteConfirmationModal").on('hidden.bs.modal', function(e) {
                    resolve();
                });
            }).then(function() {
                //Then remove
                remove(id);
            });
        });

        $("#disable-button").click(function() {
            disableJobScheme(data.id);
        });
        $("#enable-button").click(function() {
            enableJobScheme(data.id);
        });

        $("#subtractYearButton").click(function() {
            subtractYear();
        });
        $("#addYearButton").click(function() {
            addYear();
        });

    });
};

/**
 * addYear - +1 to the year counter and refreshes the input
 */
function addYear() {
    ctrl.year++;
    $("#yearCounter").val(ctrl.year);
}

/**
 * subtractYear - -1 to the year counter and refreshes the input
 */
function subtractYear() {
    ctrl.year--;
    $("#yearCounter").val(ctrl.year);
}

/**
 * ctrl.generate - Loads generate jobs page
 *
 * @return {Promise}  an empty promise
 */
ctrl.generate = function() {
    sidebarManager.add(ctrl.ctrlName, "generate", ctrl.generate.bind(this));
    ctrl.year = parseInt(new Date.today().toString("yyyy"));
    return facade.getAllClients().then(function(query) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/generateJobs.html");
        var temp = jsrender.templates(templatePath);
        var html = temp({
            clients: query,
            year: ctrl.year
        });

        $("#sidebar-heading").html("Generate Jobs");
        $("#sidebar").html(html);

        $("#subtractYearButton").click(function() {
            subtractYear();
        });
        $("#addYearButton").click(function() {
            addYear();
        });
        $("#generateClientJobsButton").click(function() {
            generateForClients();
        });
    });
};

/**
 * generateForClients - Generates jobs based on all the jobschemes of the client selected
 *
 * @return {Promise}  an empty promise
 */
function generateForClients() {
    var formData = $("#GenerateClientJobsForm").serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
    }, {});

    return facade.generateClientJobs(formData.client, formData.year, formData.month).then(function() {
        $.notify({
            //options
            message: "Jobs successfully generated"
        }, {
            //settings
            type: "success",
            delay: 3000
        });
        sidebarManager.pop();
        sidebarManager.removeHtml();
        ctrls.Jobs.index();
    });
}

/**
 * generate - Generates Jobs for the month given, based on the jobScheme
 *
 * @param  {Number} id the id of the jobscheme
 * @return {Promise}    an empty promise
 */
function generate(id) {
    var formData = $("#JobGenerationForm").serializeArray();
    return facade.generateJobs(id, ctrl.year, parseInt(formData[1].value)).then(function() {
        $.notify({
            //options
            message: "Jobs successfully generated"
        }, {
            //settings
            type: "success",
            delay: 3000
        });
        ctrls.Jobs.index();
    });
}

/**
 * ctrl.create - Displays the create job scheme page
 *
 * @param  {Number} id Optional, the id of the client, if empty, all the clients will be loaded
 * @return {Promise}    An empty promise
 */

ctrl.create = function(id) {
    sidebarManager.add(ctrl.ctrlName, "create", ctrl.create.bind(this), id);
    if (id === undefined) {
        return facade.getAllClients().then(function(data) {
            return fillCreatePage({
                clients: data
            });
        });
    } else {
        return facade.getClient(id).then(function(data) {
            return fillCreatePage({
                client: data
            });
        });
    }

};

/**
 * fillCreatePage - Fills sidebar with the create jobscheme page
 *
 * @param  {Object} data A list of clients
 * @return {Promise}      an empty promise
 */
function fillCreatePage(data) {
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/create.html");
    var temp = jsrender.templates(templatePath);
    var html = temp(data);

    $("#sidebar-heading").html("Create Service");
    $("#sidebar").html(html);

    $('.timepicker').datetimepicker({
        format: 'HH:mm'
    });

    //Add click events
    $("#form-submit-button").click(function() {
        create();
    });
    $("#addRepValues").children("span").click(function() {
        addRepValues();
    });

    //Add other events
    $("#repetitionSelector").change(function() {
        changeRepFields();
    });
}

/**
 * create - create a new job scheme based on the field values
 *
 * @return {Promise}  an empty promise
 */
function create() {
    var formData = $("#createJobSchemeForm").serializeArray();
    var repvalues = getRepValues();

    return facade.createJobScheme(formData[1].value, formData[2].value, formData[3].value, repvalues, formData[0].value).then(function(data) {
        sidebarManager.pop();
        data = data.get({
            plain: true
        });
        contentManager.reload();
        return ctrl.details(data.id);
    });
}

/**
 * getRepValues - Returns the rep values from the fields
 *
 * @return {Object}  repetition values
 */
function getRepValues() {
    var repvalues = [];
    var selected = $("#repetitionSelector").val();

    $("#repValuesDiv").children().each(function(no, data) {
        var day = 0;
        if (selected === "Monthly" || selected === "Fortnightly") {
            day = parseInt($(data).find("#day").val()) + 7 * parseInt($(data).find("#week").val());
        } else if (selected === "Weekly") {
            day = parseInt($(data).find("#day").val());
        }

        var rep = {
            day: day,
            hour: parseInt($(data).find("#time").val().split(":")[0]),
            minute: parseInt($(data).find("#time").val().split(":")[1])
        };
        repvalues.push(rep);
    });
    return repvalues;
}

/**
 * addRepValues - Adds new repetition field based on the selected repetition value
 */
function addRepValues() {
    var selected = $("#repetitionSelector").val();

    if (ctrl.repval < 7 && selected !== null) {
        var repValuesTmpl = "/";
        switch (selected) {
            case "Monthly":
                repValuesTmpl += "Monthly";
                break;
            case "Fortnightly":
                repValuesTmpl += "Fortnightly";
                break;
            case "Weekly":
                repValuesTmpl += "Weekly";
                break;
            case "Daily":
                repValuesTmpl += "Daily";
                break;
        }
        repValuesTmpl += "RepValues.html";

        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + repValuesTmpl);
        var temp = jsrender.templates(templatePath);
        ctrl.repval++;
        var data = {
            no: ctrl.repval
        };
        var html = temp(data);
        $("#repValuesDiv").append(html);
        $(".clickable-span span").click(function() {
            removeRepValues($(this));
        });

        $('.timepicker').datetimepicker({
            format: 'HH:mm'
        });
    }
}

/**
 * changeRepFields - Checks if the repetition value has changed. If yes, it will remove all the repValues
 */

function changeRepFields() {
    if (ctrl.selectedRep !== $("#repetitionSelector").val()) {
        $("#repValuesDiv").html("");
        ctrl.repval = 0;
    }
    ctrl.selectedRep = $("#repetitionSelector").val();
}

/**
 * removeRepValues - Removes the specified repValue
 *
 * @param  {Object} span The span to be removed
 */

function removeRepValues(span) {
    $(span).parent().parent().parent().remove();
    if (ctrl.repval > 0) {
        ctrl.repval--;
    }
}

/**
 * ctrl.edit - Displays the edit job scheme page
 *
 * @param  {Number} id the id of the jobScheme
 * @return {Promise}    an empty promise
 */
ctrl.edit = function(id) {
    return facade.getJobScheme(id).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/edit.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);

        sidebarManager.add(ctrl.ctrlName, "edit", ctrl.edit.bind(this), id);
        $("#sidebar-heading").html("Edit Service");
        $("#sidebar").html(html);

        $("#editJobSchemeSubmitButton").click(function() {
            edit(data.id);
        });
        $("#addRepValues span").click(function() {
            addRepValues();
        });
        $("#repetitionSelector").change(function() {
            changeRepFields();
        });

        var innerhtml = "";
        data.repetitionValues.forEach(function(value) {
            switch (data.repetition) {
                case "Monthly":
                    innerhtml += jsrender.templates(templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/MonthlyRepValuesEdit.html"))(value);
                    break;
                case "Fortnightly":
                    innerhtml += jsrender.templates(templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/FortnightlyRepValuesEdit.html"))(value);
                    break;
                case "Weekly":
                    innerhtml += jsrender.templates(templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/WeeklyRepValuesEdit.html"))(value);
                    break;
                case "Daily":
                    innerhtml += jsrender.templates(templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/DailyRepValuesEdit.html"))(value);
                    break;
            }
        });
        $("#repValuesDiv").html(innerhtml);
        $(".clickable-span span").click(function() {
            removeRepValues($(this));
        });
        $('.timepicker').datetimepicker({
            format: 'HH:mm'
        });
    });
};

/**
 * edit - Edit a job scheme based on the field values
 *
 * @param  {Number} id the id of the JobScheme
 * @return {Promise}    an empty promise
 */
function edit(id) {
    var formData = $("#editJobSchemeForm").serializeArray();
    formData.splice(3, 4);
    formData.push({
        name: "repetitionValues",
        value: getRepValues()
    });

    return facade.editJobScheme(id, formData).then(function(data) {
        sidebarManager.pop();
        contentManager.reload();
        return ctrl.details(id);
    });
}

/**
 * disableJobScheme - Disables a jobScheme
 *
 * @param  {Number} id the id of the jobScheme
 * @return {Promise}    an empty promise
 */
function disableJobScheme(id) {
    return facade.disableJobScheme(id).then(function(data) {
        contentManager.reload();
        return ctrl.details(id);
    });
}

/**
 * enableJobScheme - Enables a jobScheme
 *
 * @param  {Number} id the id of the jobScheme
 * @return {Promise}    an empty promise
 */
function enableJobScheme(id) {
    return facade.enableJobScheme(id).then(function(data) {
        contentManager.reload();
        ctrl.details(id);
    });
}

/**
 * remove - Removes a jobScheme
 *
 * @param  {Number} id the id of the jobScheme
 * @return {Promise}    an empty promise
 */
function remove(id) {
    return facade.removeJobScheme(id).then(function() {
        contentManager.reload();
        sidebarManager.goBack();
    });
}

/**
 * initiateController - Initiates the controller
 *
 * @return {Object}  JobSchemes controller
 */
function initiateController() {
    return require('../scripts/Facade.js').then(function(data) {
        facade = data;
        return ctrl;
    });
}

module.exports = initiateController();
