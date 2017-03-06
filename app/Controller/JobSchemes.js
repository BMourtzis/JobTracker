var facade;

var ctrl = {};

ctrl.ctrlName = "JobSchemes";
ctrl.templateDir = "../Templates/";
ctrl.repval = 0;
ctrl.selectedRep = "";

//var for generateJobs page;
ctrl.year = 0 ;

//TODO: add a new page for Job Schemes
ctrl.index = function() {
    contentManager.restartLineup(ctrl.ctrlName, "index", ctrl.index.bind(this));
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

ctrl.addYear = function() {
    ctrl.year++;
    $("#yearCounter").val(ctrl.year);
};

ctrl.subtractYear = function() {
    ctrl.year--;
    $("#yearCounter").val(ctrl.year);
};

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
        sidebarManager.reload();
    });
};

//Generates Jobs based on the jobScheme for the next month
ctrl.generateNextMonthsJobs = function(id) {
    var date = new Date.today();
    facade.generateJobs(id, parseInt(Date.today().toString("yyyy")), parseInt(Date.today().toString("M"))).then(function(){
        $.notify({
            //options
            message: "Jobs successfully generated"
        },{
            //settings
            type: "success",
            delay: 3000
        });
    });
};

//Displays the create job scheme page
ctrl.getCreateJobScheme = function(id) {
    facade.getClient(id).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/create.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);

        sidebarManager.add(ctrl.ctrlName, "create", ctrl.getCreateJobScheme.bind(this));
        $("#sidebar-heading").html("Create Service");
        $("#sidebar").html(html);

        $('.timepicker').datetimepicker({format: 'HH:mm'});
    });
};

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
        ctrl.jobSchemeDetails(id);
    });
};

//Enables a jobScheme
ctrl.enableJobScheme = function(id){
    facade.enableJobScheme(id).then(function(data){
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
