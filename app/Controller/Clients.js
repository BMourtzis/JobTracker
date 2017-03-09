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

        $("#create-button").click(function(){ctrl.getCreateClient();});
        $("#client-table button").click(function(){ctrl.clientDetails($(this).data("id"));});
    });

    contentManager.restartLineup(ctrl.ctrlName, "index", ctrl.index.bind(this));
};

//TODO: fix long names
//Shows client the selected client on the sidebar
ctrl.clientDetails = function(id) {
    $("#sidebar-heading").html("Client Details");
    sidebarManager.add(ctrl.ctrlName, "details", ctrl.clientDetails.bind(this), id);
    return facade.getClientFull(id).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/details.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);
        $("#sidebar").html(html);

        $("#edit-button").click(function(){ctrl.getEditClient(id);});
        $("#create-jobscheme-button").click(function(){UIFunctions.getCreateJobScheme(id);});
        $("#create-job-button").click(function(){UIFunctions.getCreateJob(id);});
        $("#see-all-jobs-button").click(function(){UIFunctions.getClientJobs(id);});
        $("#delete-button").click(function(){new Promise(function(resolve, reject){
            $("#deleteConfirmationModal").on('hidden.bs.modal', function (e) {
                resolve();
            });
        }).then(function(){
            ctrl.removeClient(id);
        });
    });

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
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/create.html");
    var temp = jsrender.templates(templatePath);

    sidebarManager.add(ctrl.ctrlName, "create", ctrl.getCreateClient.bind(this));
    $("#sidebar-heading").html("Create Client");
    $("#sidebar").html(temp);

    $("#form-submit-button").click(function(){createClient();});
};

//Creates a new Client with the field values
function createClient() {
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
    }, function(err){
        if(err.errors[0].message === "shortname must be unique" ) {
            $.notify({
                //options
                icon: 'glyphicon glyphicon-warning-sign',
                message: "Short Name is taken. Please change it."
            },{
                //settings
                type: "danger",
                delay: 10000
            });
        }

    });
}

//Displays the create client page
ctrl.getEditClient = function(id) {
    facade.getClient(id).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/edit.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);

        sidebarManager.add(ctrl.ctrlName, "edit", ctrl.getEditClient.bind(this), id);
        $("#sidebar-heading").html("Edit Client");
        $("#sidebar").html(html);

        $("#form-submit-button").click(function(){editClient(id);});
    });
};

//Edit a Client with the field values
function editClient(id) {
    var formData = $("#editClientForm").serializeArray();
    formData[1].value = formData[1].value.toUpperCase();

    facade.editClient(id, formData).then(function(){
        sidebarManager.pop();
        contentManager.reload();
        ctrl.clientDetails(id);
    }, function(err){
        if(err.errors[0].message === "shortname must be unique" ) {
            $.notify({
                //options
                icon: 'glyphicon glyphicon-warning-sign',
                message: "Short Name is taken. Please change it."
            },{
                //settings
                type: "danger",
                delay: 10000
            });
        }
    });
}

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
