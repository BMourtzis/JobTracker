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
    ctrl.UpdateInvoiceOutputPath();
};

ctrl.UpdateInvoiceTemplatePath = function() {
    var path = dialog.showOpenDialog({ defaultPath: settings.InvoiceTemplatePath, properties: ['openFile']})[0];
    facade.UpdateInvoiceTemplatePath(path);
    //Update Field;
};

ctrl.UpdateInvoiceOutputPath = function(){
    var path = dialog.showOpenDialog({defaultPath: settings.InvoiceOutputPath, properties: ['openDirectory']})[0];
    facade.UpdateInvoiceOutputPath(path);
};

ctrl.UpdateBackupPath = function(){
    var path = dialog.showOpenDialog({ defaultPath: settings.BackupPath, properties: ['openDirectory']})[0];
    facade.UpdateBackupPath(path);
};

ctrl.UpdateGSTPercentage = function(){
    facade.UpdateBackupPath(gst);
};

module.exports = function getController() {
    return require('../scripts/Facade.js')().then(function(data) {
        facade = data;
        return ctrl;
    });
};
