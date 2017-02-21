var facade = require('../scripts/Facade.js');

var ctrl = {};

ctrl.ctrlName = "JobSchemes";
ctrl.templateDir = "./app/Templates/";
ctrl.repval = 0;
ctrl.selectedRep = "";

//Copied from other controllers, might not need it
ctrl.index = function() {

};

//Get and Displays the jobScheme details on the sidebar
ctrl.jobSchemeDetails = function(id) {
    facade.getJobSchemeFull(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/details.html');
        var html = temp(data);
        $("#sidebar").html(html);
    });
};

//Generates Jobs for the month given, based on the jobScheme
ctrl.generateJobs = function(id, month) {
    facade.generateJobs(id, month);
};

//Generates Jobs based on the jobScheme for the next month
ctrl.generateNextMonthsJobs = function(id) {
    var date = new Date.today();
    var month = parseInt(Date.today().toString("M"));
    facade.generateJobs(id, month);
};

//Displays the create job scheme page
ctrl.getCreateJobScheme = function(id) {
    facade.getClient(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/create.html');
        var html = temp(data);
        $("#sidebar").html(html);

        $('.timepicker').datetimepicker({format: 'HH:mm'});
    });
};

//create a new job scheme based on the field values
ctrl.createJobScheme = function() {
    var formData = $("#createJobSchemeForm").serializeArray();
    var repvalues = ctrl.getRepValues();

    facade.createJobScheme(formData[1].value, formData[2].value, formData[3].value, repvalues, formData[0].value).then(function() {
        UIFunctions.clientDetails(formData[0].value);
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

    if(ctrl.repval < 6 && selected !== null)
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

        var row = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + repValuesTmpl);
        ctrl.repval++;
        var data = { no: ctrl.repval };
        var html = row(data);
        $("#repValuesDiv").append(html);

        $('.timepicker').datetimepicker({format: 'HH:mm'});
    }
};

//Checks if the repetition value has changed.
//If yes, it will remove all the repValues
ctrl.changeRepFields = function() {
    if (ctrl.selectedRep !== $("#repetitionSelector").val()) {
        $("#repValuesDiv").html("");
    }
    ctrl.selectedRep = $("#repetitionSelector").val();
};

//Remove the specified repValue
ctrl.removeRepValues = function() {
    if(ctrl.repval > 0) {
        ctrl.repval--;
    }
};

//TODO: add edit page and functionality

//Displays the edit job scheme page
ctrl.getEditJobScheme = function(id) {
    facade.getJobScheme(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/edit.html');
        var html = temp(data);
        $("#sidebar").html(html);

        var innerhtml = "";
        data.repetitionValues.forEach(function(value){

            switch (data.repetition) {
                case "Monthly":
                    innerhtml += jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/MonthlyRepValuesEdit.html')(value);
                    break;
                case "Fortnightly":
                    innerhtml += jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/FortnightlyRepValuesEdit.html')(value);
                    break;
                case "Weekly":
                    innerhtml += jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/WeeklyRepValuesEdit.html')(value);
                    break;
                case "Daily":
                    innerhtml += jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/DailyRepValuesEdit.html')(value);
                    break;
            }
        });
        $("#repValuesDiv").html(innerhtml);
    });
};

//Edit a job scheme based on the field values
ctrl.editJobScheme = function(id) {

};

//Disables a jobScheme
ctrl.disableJobScheme = function(id){
    facade.editJobScheme(id, [{name: "enabled", value: false}]);
};

//Enables a jobScheme
ctrl.enableJobScheme = function(id){
    facade.editJobScheme(id, [{name: "enabled", value: true}]);
};

module.exports = ctrl;
