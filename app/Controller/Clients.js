var facade = require('../scripts/Facade.js');

var ctrl = {};

ctrl.ctrlName = "Clients";
ctrl.templateDir = "./app/Templates/";

ctrl.index = function() {
    facade.getAllClients().then(function(query) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/index.html');
        var data = {
            clients: query
        };
        var html = temp(data);
        $("#content").html(html);

        $("#client-table.clickable-row").click(function() {
            var id = $(this).data("id");
            ctrl.clientDetails(id);
        });
    });
};

//TODO: Add pagination, maybe not
ctrl.clientDetails = function(id) {
    facade.getClientFull(id).then(function(data) {
        data.jobs = data.jobs.slice(0,9);
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/details.html');
        var html = temp(data);
        $("#sidebar").html(html);

        $("#client-job-table.clickable-row").click(function() {
            var id = $(this).data("id");
            UIFunctions.jobDetails(id);
        });

        $("#client-job-scheme-table.clickable-row").click(function() {
            var id = $(this).data("id");
            UIFunctions.jobSchemeDetails(id);
        });
    });
};

ctrl.getCreateClient = function() {
    var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/create.html');
    $("#sidebar").html(temp);
};

ctrl.createClient = function() {
    var formData = $("#createClientForm").serializeArray();
    formData[1].value = formData[1].value.toUpperCase();
    console.log(formData);
    facade.createClient(formData[2].value, formData[3].value, formData[0].value, formData[1].value, formData[4].value, formData[5].value, formData[6].value).then(function() {
        ctrl.index();
    });
};

ctrl.getEditClient = function(id) {
    facade.getClient(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/edit.html');
        var html = temp(data);
        $("#sidebar").html(html);
    });
};

ctrl.editClient = function(id) {
    var formData = $("#editClientForm").serializeArray();
    formData[1].value = formData[1].value.toUpperCase();

    facade.editClient(id, formData).then(function(){
        ctrl.index();
        ctrl.clientDetails(id);
    });
};

module.exports = ctrl;
