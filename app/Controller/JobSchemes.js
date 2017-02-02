var ctrl = {};

ctrl.ctrlName = "JobSchemes";
ctrl.templateDir = "./app/Templates/";
ctrl.repval = 0;

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
    var repvalues = [];
    $("#repValuesDiv").children().each(function(no, data) {
        var rep = {
            day: $(data).find("select").val(),
            hour: $(data).find("input").val().split(":")[0],
            minute: $(data).find("input").val().split(":")[1]
        };
        repvalues.push(rep);
    });
    facade.createJobScheme(formData[1].value, formData[2].value, formData[3].value, repvalues, formData[0].value).then(function() {
        UIFunctions.clientDetails(formData[0].value);
    });
};

ctrl.addRepValues = function() {
    if(ctrl.repval < 6)
    {
        var row = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/RepValues.html');
        ctrl.repval++;
        var data = { no: ctrl.repval };
        var html = row(data);
        $("#repValuesDiv").append(html);

        $('.timepicker').datetimepicker({format: 'HH:mm'});
    }
};

ctrl.generateNextMonthsJobs = function() {

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

ctrl.editClient = function(id) {
    var formData = $("#editClientForm").serializeArray();
    facade.editClient(id, formData);
};

module.exports = ctrl;
