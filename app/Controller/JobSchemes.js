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

//TODO: add a new page for Job Schemes
ctrl.index = function() {
    contentManager.restartLineup(ctrl.ctrlName, "index", ctrl.index.bind(this));
    return initiateIndexPage().then(function(){
        return loadActiveJobs();
    });
};

function initiateIndexPage() {
    return facade.getAllClients().then(function(query) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/index.html");
        var temp = jsrender.templates(templatePath);
        var html = temp({clients: query});
        $("#content").html(html);

        $("#searchJobSchemesButton").click(ctrl.searchJobSchemes);

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
}

ctrl.searchJobSchemes = function() {
    $("#advSearchModal").modal('hide');
    contentManager.add(ctrl.ctrlName, "search", ctrl.reloadSearch.bind(this));

    var formData = $("#searchOptionsForm").serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
    },{});

    ctrl.currentPage = 0;
    ctrl.searchParams = formData;
    return facade.searchJobSchemes(formData, ctrl.currentPage).then(function(data) {
        return loadTable(data);
    });
};

ctrl.reloadSearch = function() {
    return facade.searchJobSchemes(ctrl.searchParams, ctrl.currentPage).then(function(data){
        loadTable(data);
    });
};

ctrl.gotoPage = function(page) {
    ctrl.currentPage = page;
    return ctrl.reloadSearch();
};

//Get and Displays the jobScheme details on the sidebar
ctrl.jobSchemeDetails = function(id) {
    facade.getJobSchemeFull(id).then(function(data) {
        ctrl.year = parseInt(new Date.today().toString("yyyy"));
        data.year = ctrl.year;

        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/details.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);
        $("#sidebar-heading").html("Service Details");
        $("#sidebar").html(html);
    });
    sidebarManager.add(ctrl.ctrlName, "details", ctrl.jobSchemeDetails.bind(this), id);
};

function addYear() {
    ctrl.year++;
    $("#yearCounter").val(ctrl.year);
}

function subtractYear() {
    ctrl.year--;
    $("#yearCounter").val(ctrl.year);
}

ctrl.getGenerateJobs = function() {
    sidebarManager.add(ctrl.ctrlName, "generate", ctrl.getGenerateJobs.bind(this));
    ctrl.year = parseInt(new Date.today().toString("yyyy"));
    return facade.getAllClients().then(function(query) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/generateJobs.html");
        var temp = jsrender.templates(templatePath);
        var html = temp({clients: query, year: ctrl.year});

        $("#sidebar-heading").html("Generate Jobs");
        $("#sidebar").html(html);

        $("#subtractYearButton").click(subtractYear);
        $("#addYearButton").click(addYear);
        $("#generateClientJobsButton").click(generateJobsForClients);
    });
};

function generateJobsForClients() {
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
ctrl.generateJobs = function(id) {
    var formData = $("#JobGenerationForm").serializeArray();
    facade.generateJobs(id, ctrl.year, parseInt(formData[1].value)).then(function() {
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
};

//Displays the create job scheme page
ctrl.getCreateJobScheme = function(id) {
    sidebarManager.add(ctrl.ctrlName, "create", ctrl.getCreateJobScheme.bind(this), id);
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
}

//create a new job scheme based on the field values
ctrl.createJobScheme = function() {
    var formData = $("#createJobSchemeForm").serializeArray();
    var repvalues = ctrl.getRepValues();

    facade.createJobScheme(formData[1].value, formData[2].value, formData[3].value, repvalues, formData[0].value).then(function(data) {
        sidebarManager.pop();
        data = data.get({plain: true});
        contentManager.reload();
        ctrl.jobSchemeDetails(data.id);
    });
};

//Returns the rep values from the fields
ctrl.getRepValues = function(){
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
};


//Adds new repetition field based on the selected repetition value
ctrl.addRepValues = function() {
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

        $('.timepicker').datetimepicker({format: 'HH:mm'});
    }
};

//Checks if the repetition value has changed.
//If yes, it will remove all the repValues
ctrl.changeRepFields = function() {
    if (ctrl.selectedRep !== $("#repetitionSelector").val()) {
        $("#repValuesDiv").html("");
        ctrl.repval = 0;
    }
    ctrl.selectedRep = $("#repetitionSelector").val();
};

//Remove the specified repValue
ctrl.removeRepValues = function(data) {
    $(data).parent().remove();
    if(ctrl.repval > 0) {
        ctrl.repval--;
    }
};

//Displays the edit job scheme page
ctrl.getEditJobScheme = function(id) {
    facade.getJobScheme(id).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/edit.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);

        sidebarManager.add(ctrl.ctrlName, "edit", ctrl.getEditJobScheme.bind(this), id);
        $("#sidebar-heading").html("Edit Service");
        $("#sidebar").html(html);

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
    });
};

//Edit a job scheme based on the field values
ctrl.editJobScheme = function(id) {
    var formData = $("#editJobSchemeForm").serializeArray();
    formData.splice(3,4);
    formData.push({
        name: "repetitionValues",
        value: ctrl.getRepValues()
    });

    facade.editJobScheme(id, formData).then(function(data){
        sidebarManager.pop();
        contentManager.reload();
        ctrl.jobSchemeDetails(id);
    });

};

//Disables a jobScheme
ctrl.disableJobScheme = function(id){
    facade.disableJobScheme(id).then(function(data){
        contentManager.reload();
        ctrl.jobSchemeDetails(id);
    });
};

//Enables a jobScheme
ctrl.enableJobScheme = function(id){
    facade.enableJobScheme(id).then(function(data){
        contentManager.reload();
        ctrl.jobSchemeDetails(id);
    });
};

ctrl.removeJobScheme = function(id) {
    facade.removeJobScheme(id).then(function() {
        contentManager.reload();
        sidebarManager.goBack();
    });
};

module.exports = function getController() {
    return require('../scripts/Facade.js')().then(function(data){
        facade = data;
        return ctrl;
    });
};
