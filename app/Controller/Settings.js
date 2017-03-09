var facade;
var dialog = require('electron').remote.dialog;

var ctrl = {};

ctrl.ctrlName = "Settings";
ctrl.templateDir = "../Templates/";

ctrl.index = function() {
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/index.html");
    var temp = jsrender.templates(templatePath);
    var html = temp(settings);
    $("#content").html(html);

    $("#InvoiceTemplatePath").click(function(){UpdateInvoiceTemplatePath();});
    $("#InvoiceOutputPath").click(function(){UpdateInvoiceOutputPath();});
    $("#BackupPath").click(function(){UpdateBackupPath();});
    $("#GSTPercentage").keyup(function(){UpdateGSTPercentage();});

    contentManager.restartLineup(ctrl.ctrlName, "index", ctrl.index.bind(this));
};

function UpdateInvoiceTemplatePath() {
    var dialogReturn = dialog.showOpenDialog({ defaultPath: settings.InvoiceTemplatePath, properties: ['openFile']});
    if(dialogReturn !== undefined) {
        var path = dialogReturn[0];
        facade.UpdateInvoiceTemplatePath(path);
        $($("#InvoiceTemplatePath :input")[0]).val(path);
    }
}

function UpdateInvoiceOutputPath(){
    var dialogReturn = dialog.showOpenDialog({defaultPath: settings.InvoiceOutputPath, properties: ['openDirectory']});
    if(dialogReturn !== undefined) {
        var path = dialogReturn[0];
        facade.UpdateInvoiceOutputPath(path);
        $($("#InvoiceOutputPath :input")[0]).val(path);
    }
}

function UpdateBackupPath(){
    var dialogReturn = dialog.showOpenDialog({ defaultPath: settings.BackupPath, properties: ['openDirectory']});
    if(dialogReturn !== undefined) {
        var path = dialogReturn[0];
        facade.UpdateBackupPath(path);
        $($("#BackupPath :input")[0]).val(path);
    }
}

function UpdateGSTPercentage(){
    var gst = parseInt($($("#GSTPercentage :input")[0]).val());
    if(!Number.isNaN(gst)) {
        facade.UpdateGSTPercentage(gst);
    }
}

module.exports = function getController() {
    return require('../scripts/Facade.js')().then(function(data) {
        facade = data;
        return ctrl;
    });
};
