var ctrl = {};

ctrl.ctrlName = "JobSchemes";
ctrl.templateDir = "./app/Templates/";
ctrl.repval = 0;
ctrl.selectedRep = "";

ctrl.index = function() {
    facade.getAllClients().then(function(query) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/index.html');
        var data = {
            clients: []
        };
        for (var i = 0; i < query.length; i++) {
            data.clients.push(query[i].get({
                plain: true
            }));
        }
        var html = temp(data);
        $("#content").html(html);

        $("#client-table.clickable-row").click(function() {
            var id = $(this).data("id");
            ctrl.clientDetails(id);
        });
    });
};

ctrl.jobSchemeDetails = function(id) {
    facade.getJobSchemeFull(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/details.html');
        var html = temp(data);
        $("#sidebar").html(html);
    });
};

ctrl.generateJobs = function(id) {
    facade.generateJobs(id);
};

ctrl.getCreateJobScheme = function(id) {
    facade.getClient(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/create.html');
        var html = temp(data);
        $("#sidebar").html(html);

        $('.timepicker').datetimepicker({format: 'HH:mm'});
    });
};

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

ctrl.changeRepFields = function() {
    if (ctrl.selectedRep !== $("#repetitionSelector").val()) {
        $("#repValuesDiv").html("");
    }
    ctrl.selectedRep = $("#repetitionSelector").val();
};

ctrl.generateNextMonthsJobs = function(id) {
    var date = new Date.today();
    var month = parseInt(Date.today().toString("M"));
    facade.generateJobs(id, month);
};

ctrl.removeRepValues = function() {
    if(ctrl.repval > 0) {
        ctrl.repval--;
    }
};

ctrl.getEditClient = function(id) {
    facade.getClient(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/edit.html');
        var client = data.get({
            plain: true
        });
        var html = temp(client);
        $("#sidebar").html(html);
    });
};

ctrl.disableJobScheme = function(id){
    facade.editJobScheme(id, [{name: "enabled", value: false}]);
};

ctrl.enableJobScheme = function(id){
    facade.editJobScheme(id, [{name: "enabled", value: true}]);
};

ctrl.editClient = function(id) {
    var formData = $("#editClientForm").serializeArray();
    facade.editClient(id, formData);
};

module.exports = ctrl;
