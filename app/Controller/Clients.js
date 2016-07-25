var ctrl = {}

ctrl.ctrlName = "Clients";
ctrl.templateDir = "./app/Templates/";

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

ctrl.getCreateClient = function() {
    var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/create.html');
    $("#sidebar").html(temp);
}

ctrl.createClient = function() {
    var formData = $("#createClientForm").serializeArray();
    orm.createClient(formData[2].value, formData[3].value, formData[0].value, formData[1].value, formData[4].value, formData[5].value, formData[6].value).then(function() {
        ctrl.index();
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
