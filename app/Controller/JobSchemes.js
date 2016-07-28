var ctrl = {}

ctrl.ctrlName = "JobSchemes";
ctrl.templateDir = "./app/Templates/";
ctrl.repval = 0;

ctrl.index = function() {
    orm.getAllClients().then(function(query) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/index.html');
        var data = {
            clients: new Array()
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
}

ctrl.clientDetails = function(id) {
    orm.getClient(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/details.html');
        var client = data.get({
            plain: true
        });
        var html = temp(client);
        $("#sidebar").html(html);

        $("#client-job-table.clickable-row").click(function() {
            var id = $(this).data("id");
            UIFunctions.jobDetails(id);
        });
    });
}

ctrl.getCreateJobScheme = function(id) {
    orm.getClient(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/create.html');
        var client = data.get({
            plain: true
        });
        var html = temp(client);
        $("#sidebar").html(html);

        $('.timepicker').datetimepicker({format: 'HH:mm'});
    });
}

ctrl.addRepValues = function() {
    if(ctrl.repval < 6)
    {
        var row = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/RepValues.html');
        ctrl.repval++;
        var data = { no: ctrl.repval }
        var html = row(data);
        $("#repValuesDiv").append(html);

        $('.timepicker').datetimepicker({format: 'HH:mm'});
    }
}

ctrl.removeRepValues = function() {
    if(ctrl.repval > 0) {
        ctrl.repval--
    }
}

ctrl.createJobScheme = function() {
    var formData = $("#createJobSchemeForm").serializeArray();
    var repvalues = new Array();
    $("#repValuesDiv").children().each(function(no, data) {
        var rep = {
            day: $(data).find("select").val(),
            time: $(data).find("input").val()
        }
        repvalues.push(rep);
    });
    orm.createJobScheme(formData[1].value, formData[2].value, formData[3].value, repvalues, formData[0].value).then(function() {
        UIFunctions.clientDetails(formData[0].value);
    });
}

ctrl.getEditClient = function(id) {
    orm.getClient(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/edit.html');
        var client = data.get({
            plain: true
        });
        var html = temp(client);
        $("#sidebar").html(html);
    });
}

ctrl.editClient = function(id) {
    var formData = $("#editClientForm").serializeArray();
    orm.editClient(id, formData);
}

module.exports = ctrl;
