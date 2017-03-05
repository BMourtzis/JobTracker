var facade;

var ctrl = {};

ctrl.ctrlName = "Clients";
ctrl.templateDir = "../Templates/";

//Shows a table of all the clients
ctrl.index = function() {
    facade.getAllClients().then(function(query) {

        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/index.html");
        var temp = jsrender.templates(templatePath);
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

    contentManager.restartLineup(ctrl.ctrlName, "index", ctrl.index.bind(this));
};

//TODO: Add pagination, maybe not
//TODO: fix long names
//Shows client the selected client on the sidebar
ctrl.clientDetails = function(id) {
    facade.getClientFull(id).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/details.html");
        var temp = jsrender.templates(templatePath);
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
    $("#sidebar-heading").html("Client Details");
    sidebarManager.add(ctrl.ctrlName, "details", ctrl.clientDetails.bind(this), id);
};

//TODO: add validation on fields
//Displays the create client page
ctrl.getCreateClient = function() {
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/create.html");
    var temp = jsrender.templates(templatePath);

    sidebarManager.add(ctrl.ctrlName, "create", ctrl.getCreateClient.bind(this));
    $("#sidebar-heading").html("Create Client");
    $("#sidebar").html(temp);
};

//Creates a new Client with the field values
ctrl.createClient = function() {
    var formData = $("#createClientForm").serializeArray();
    formData[1].value = formData[1].value.toUpperCase();
    if(formData[5].value === "") { formData[5].value = null; }
    formData[6].value =  parseInt(formData[6].value);
    if(Number.isNaN(formData[6].value)){ formData[6].value = null; }

    facade.createClient(formData[2].value, formData[3].value, formData[0].value, formData[1].value, formData[4].value, formData[5].value, formData[6].value).then(function(data) {
        data = data.get({plain: true});
        sidebarManager.pop();
        contentManager.reload();
        ctrl.clientDetails(data.id);
    });
};

//Displays the create client page
ctrl.getEditClient = function(id) {
    facade.getClient(id).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/edit.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);

        sidebarManager.add(ctrl.ctrlName, "edit", ctrl.getEditClient.bind(this), id);
        $("#sidebar-heading").html("Edit Client");
        $("#sidebar").html(html);
    });
};

//Edit a Client with the field values
ctrl.editClient = function(id) {
    var formData = $("#editClientForm").serializeArray();
    formData[1].value = formData[1].value.toUpperCase();

    facade.editClient(id, formData).then(function(){
        sidebarManager.pop();
        contentManager.reload();
        ctrl.clientDetails(id);
    });
};

ctrl.removeClient = function(id) {
    facade.removeClient(id).then(function(){
        sidebarManager.goBack();
        contentManager.reload();
    });
};

module.exports = function getController() {
    return require('../scripts/Facade.js')().then(function(data){
        facade = data;
        return ctrl;
    });
};
