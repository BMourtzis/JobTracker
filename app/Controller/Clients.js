var facade = require('../scripts/Facade.js');

var ctrl = {};

ctrl.ctrlName = "Clients";
ctrl.templateDir = "./app/Templates/";

//Shows a table of all the clients
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

//Shows client the selected client on the sidebar
ctrl.clientDetails = function(id) {
    facade.getClientFull(id).then(function(data) {

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

//Displays the create client page
ctrl.getCreateClient = function() {
    var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/create.html');
    $("#sidebar").html(temp);
};

//Creates a new Client with the field values
ctrl.createClient = function() {
    var formData = $("#createClientForm").serializeArray();
    formData[1].value = formData[1].value.toUpperCase();
    if(formData[5].value === "") { formData[5].value = null; }
    formData[6].value =  parseInt(formData[6].value);
    if(Number.isNaN(formData[6].value)){ formData[6].value = null; }

    facade.createClient(formData[2].value, formData[3].value, formData[0].value, formData[1].value, formData[4].value, formData[5].value, formData[6].value).then(function() {
        ctrl.index();
    });
};

//Displays the create client page
ctrl.getEditClient = function(id) {
    facade.getClient(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/edit.html');
        var html = temp(data);
        $("#sidebar").html(html);
    });
};

//Edit a Client with the field values
ctrl.editClient = function(id) {
    var formData = $("#editClientForm").serializeArray();
    formData[1].value = formData[1].value.toUpperCase();

    facade.editClient(id, formData).then(function(){
        ctrl.index();
        ctrl.clientDetails(id);
    });
};

//TODO: add remove client funcitonality

module.exports = ctrl;
