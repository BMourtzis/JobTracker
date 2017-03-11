var facade;

var ctrl = {};

ctrl.ctrlName = "JobSchemes";
ctrl.templateDir = "../Templates/";
ctrl.repval = 0;
ctrl.selectedRep = "";

//var for generateJobs page;
ctrl.year = 0 ;

//Search Options
ctrl.currentPage = 0;
ctrl.searchParams = {};

ctrl.index = function() {
    contentManager.restartLineup(ctrl.ctrlName, "index", ctrl.index.bind(this));
    return initiatePage().then(function(){
        return loadActiveJobs();
    });
};

function initiatePage() {
    return facade.getAllClients().then(function(query) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/index.html");
        var temp = jsrender.templates(templatePath);
        var html = temp({clients: query});
        $("#content").html(html);

        $("#searchJobSchemesButton").click(function(){search();});
        $("#generate-button").click(function(){ctrl.generate();});
        $("#create-button").click(function(){ctrl.create();});

        $('#fromTimepicker').datetimepicker({format: 'HH:mm'});
        $('#toTimepicker').datetimepicker({
            format: 'HH:mm',
            useCurrent: false
        });

        $('#fromTimepicker').on("dp.change", function(e){
            $('#toTimepicker').data("DateTimePicker").minDate(e.date);
        });

        $('#toTimepicker').on("dp.change", function(e){
            $('#fromTimepicker').data("DateTimePicker").maxDate(e.date);
        });

        ctrl.currentPage = 0;
    });
}

function loadActiveJobs() {
    ctrl.searchParams = { enabled: true };
    return facade.getActiveJobSchemes().then(function(data) {
        loadTable(data);
    });
}

function loadTable(data) {
    data.currentPage = ctrl.currentPage;

    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/table.html");
    var tableTemp = jsrender.templates(templatePath);
    var table = tableTemp(data);
    $("#JobSchemesTable").html(table);

    $("#paginationNavBar li").click(function(){gotoPage($(this).data("id"));});
    $("#jobSchemes-table button").click(function(){ctrl.details($(this).data("id"));});
}

function search() {
    $("#advSearchModal").modal('hide');
    contentManager.add(ctrl.ctrlName, "search", reload.bind(this));

    var formData = $("#searchOptionsForm").serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
    },{});

    ctrl.currentPage = 0;
    ctrl.searchParams = formData;
    return facade.searchJobSchemes(ctrl.searchParams, ctrl.currentPage).then(function(data) {
        return loadTable(data);
    });
}

ctrl.getClientSchemes = function(clientId) {
    contentManager.add(ctrl.ctrlName, "reload", reload.bind(this));
    ctrl.searchParams = {client: clientId};
    initiatePage();
    return facade.searchJobSchemes(ctrl.searchParams, ctrl.currentPage).then(function(data) {
        return loadTable(data);
    });
};

function reload() {
    return facade.searchJobSchemes(ctrl.searchParams, ctrl.currentPage).then(function(data){
        loadTable(data);
    });
}

function gotoPage(page) {
    ctrl.currentPage = page;
    return reload();
}

//Get and Displays the jobScheme details on the sidebar
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
        $("#edit-button").click(function(){ctrl.edit(id);});
        $("#generateJobsButton").click(function() {generate(id);});
        $("#removeJobSchemeButton").click(function(){
            //Wait until modal is dissmissed
            new Promise(function(resolve, reject){
                $("#deleteConfirmationModal").on('hidden.bs.modal', function (e) {
                    resolve();
                });
            }).then(function(){
                //Then remove
                remove(id);
            });
        });

        $("#disable-button").click(function(){disableJobScheme(data.id);});
        $("#enable-button").click(function(){enableJobScheme(data.id);});

        $("#subtractYearButton").click(function(){subtractYear();});
        $("#addYearButton").click(function(){addYear();});

    });
};

function addYear() {
    ctrl.year++;
    $("#yearCounter").val(ctrl.year);
}

function subtractYear() {
    ctrl.year--;
    $("#yearCounter").val(ctrl.year);
}

ctrl.generate = function() {
    sidebarManager.add(ctrl.ctrlName, "generate", ctrl.generate.bind(this));
    ctrl.year = parseInt(new Date.today().toString("yyyy"));
    return facade.getAllClients().then(function(query) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/generateJobs.html");
        var temp = jsrender.templates(templatePath);
        var html = temp({clients: query, year: ctrl.year});

        $("#sidebar-heading").html("Generate Jobs");
        $("#sidebar").html(html);

        $("#subtractYearButton").click(function(){subtractYear();});
        $("#addYearButton").click(function(){addYear();});
        $("#generateClientJobsButton").click(function(){generateForClients();});
    });
};

function generateForClients() {
    var formData = $("#GenerateClientJobsForm").serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
    },{});

    return facade.generateClientJobs(formData.client, formData.year, formData.month).then(function(){
        $.notify({
            //options
            message: "Jobs successfully generated"
        },{
            //settings
            type: "success",
            delay: 3000
        });
        sidebarManager.pop();
        sidebarManager.removeHtml();
        UIFunctions.jobs();
    });
}

//Generates Jobs for the month given, based on the jobScheme
function generate(id) {
    var formData = $("#JobGenerationForm").serializeArray();
    return facade.generateJobs(id, ctrl.year, parseInt(formData[1].value)).then(function() {
        $.notify({
            //options
            message: "Jobs successfully generated"
        },{
            //settings
            type: "success",
            delay: 3000
        });
        UIFunctions.jobs();
    });
}

//Displays the create job scheme page
ctrl.create = function(id) {
    sidebarManager.add(ctrl.ctrlName, "create", ctrl.create.bind(this), id);
    if(id === undefined) {
        return facade.getAllClients().then(function(data) {
            return fillCreatePage({clients: data});
        });
    }
    else {
        return facade.getClient(id).then(function(data){
            return fillCreatePage({client: data});
        });
    }

};

function fillCreatePage(data) {
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/create.html");
    var temp = jsrender.templates(templatePath);
    var html = temp(data);

    $("#sidebar-heading").html("Create Service");
    $("#sidebar").html(html);

    $('.timepicker').datetimepicker({format: 'HH:mm'});

    //Add click events
    $("#form-submit-button").click(function(){create();});
    $("#addRepValues").children("span").click(function(){addRepValues();});

    //Add other events
    $("#repetitionSelector").change(function(){changeRepFields();});
}

//create a new job scheme based on the field values
function create() {
    var formData = $("#createJobSchemeForm").serializeArray();
    var repvalues = getRepValues();

    facade.createJobScheme(formData[1].value, formData[2].value, formData[3].value, repvalues, formData[0].value).then(function(data) {
        sidebarManager.pop();
        data = data.get({plain: true});
        contentManager.reload();
        ctrl.details(data.id);
    });
}

//Returns the rep values from the fields
function getRepValues(){
    var repvalues = [];
    var selected = $("#repetitionSelector").val();

    $("#repValuesDiv").children().each(function(no, data) {
        var day = 0;
        if(selected === "Monthly" || selected === "Fortnightly")
        {
            day = parseInt($(data).find("#day").val()) + 7*parseInt($(data).find("#week").val());
        }
        else if(selected === "Weekly")
        {
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


//Adds new repetition field based on the selected repetition value
function addRepValues() {
    var selected = $("#repetitionSelector").val();

    if(ctrl.repval < 7 && selected !== null)
    {
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
        var data = { no: ctrl.repval };
        var html = temp(data);
        $("#repValuesDiv").append(html);
        $(".clickable-span span").click(function(){removeRepValues($(this));});

        $('.timepicker').datetimepicker({format: 'HH:mm'});
    }
}

//Checks if the repetition value has changed.
//If yes, it will remove all the repValues
function changeRepFields() {
    if (ctrl.selectedRep !== $("#repetitionSelector").val()) {
        $("#repValuesDiv").html("");
        ctrl.repval = 0;
    }
    ctrl.selectedRep = $("#repetitionSelector").val();
}

//Remove the specified repValue
function removeRepValues(span) {
    $(span).parent().parent().parent().remove();
    if(ctrl.repval > 0) {
        ctrl.repval--;
    }
}

//Displays the edit job scheme page
ctrl.edit = function(id) {
    facade.getJobScheme(id).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/edit.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);

        sidebarManager.add(ctrl.ctrlName, "edit", ctrl.edit.bind(this), id);
        $("#sidebar-heading").html("Edit Service");
        $("#sidebar").html(html);

        $("#editJobSchemeSubmitButton").click(function(){edit(data.id);});
        $("#addRepValues span").click(function(){addRepValues();});
        $("#repetitionSelector").change(function(){changeRepFields();});

        var innerhtml = "";
        data.repetitionValues.forEach(function(value){
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
        $(".clickable-span span").click(function(){removeRepValues($(this));});
        $('.timepicker').datetimepicker({format: 'HH:mm'});
    });
};

//Edit a job scheme based on the field values
function edit(id) {
    var formData = $("#editJobSchemeForm").serializeArray();
    formData.splice(3,4);
    formData.push({
        name: "repetitionValues",
        value: getRepValues()
    });

    return facade.editJobScheme(id, formData).then(function(data){
        sidebarManager.pop();
        contentManager.reload();
        ctrl.details(id);
    });
}

//Disables a jobScheme
function disableJobScheme(id){
    return facade.disableJobScheme(id).then(function(data){
        contentManager.reload();
        ctrl.details(id);
    });
}

//Enables a jobScheme
function enableJobScheme(id){
    return facade.enableJobScheme(id).then(function(data){
        contentManager.reload();
        ctrl.details(id);
    });
}

function remove(id) {
    return facade.removeJobScheme(id).then(function() {
        contentManager.reload();
        sidebarManager.goBack();
    });
}

module.exports = function getController() {
    return require('../scripts/Facade.js')().then(function(data){
        facade = data;
        return ctrl;
    });
};
