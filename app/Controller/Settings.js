var facade;
var dialog = require('electron').remote.dialog;

var ctrl = {};

ctrl.ctrlName = "Settings";
ctrl.templateDir = "../Templates/";

/**
 * ctrl.index - Loads the settings page on the content div
 */
ctrl.index = function() {
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/index.html");
    var temp = jsrender.templates(templatePath);

    var tempSettings = settings;
    
    tempSettings.updateReady = window.updateReady;
    tempSettings.version = app.getVersion();

    var html = temp(tempSettings);
    $("#content").html(html);

    $("#InvoiceTemplatePath").click(function() {
        UpdateInvoiceTemplatePath();
    });
    $("#InvoiceOutputPath").click(function() {
        UpdateInvoiceOutputPath();
    });
    $("#BackupPath").click(function() {
        UpdateBackupPath();
    });
    $("#GSTPercentage").keyup(function() {
        UpdateGSTPercentage();
    });
    $("#update-version-button").click(function(){
        InstallUpdate();
    });

    contentManager.restartLineup(ctrl.ctrlName, "index", ctrl.index.bind(this));
};

/**
 * UpdateInvoiceTemplatePath - Updates the Invoice Template Path in the settings file
 */
function UpdateInvoiceTemplatePath() {
    var dialogReturn = dialog.showOpenDialog({
        defaultPath: settings.InvoiceTemplatePath,
        properties: ['openFile']
    });
    if (dialogReturn !== undefined) {
        var path = dialogReturn[0];
        facade.UpdateInvoiceTemplatePath(path);
        $($("#InvoiceTemplatePath :input")[0]).val(path);
    }
}

/**
 * UpdateInvoiceOutputPath - Updates the Invoice Output Path in the settings file
 */
function UpdateInvoiceOutputPath() {
    var dialogReturn = dialog.showOpenDialog({
        defaultPath: settings.InvoiceOutputPath,
        properties: ['openDirectory']
    });
    if (dialogReturn !== undefined) {
        var path = dialogReturn[0];
        facade.UpdateInvoiceOutputPath(path);
        $($("#InvoiceOutputPath :input")[0]).val(path);
    }
}

/**
 * UpdateBackupPath - Updates the Backup Path in the settings file
 */
function UpdateBackupPath() {
    var dialogReturn = dialog.showOpenDialog({
        defaultPath: settings.BackupPath,
        properties: ['openDirectory']
    });
    if (dialogReturn !== undefined) {
        var path = dialogReturn[0];
        facade.UpdateBackupPath(path);
        $($("#BackupPath :input")[0]).val(path);
    }
}

/**
 * UpdateGSTPercentage - Updates the GST Percentage in the settings file
 */
function UpdateGSTPercentage() {
    var gst = parseInt($($("#GSTPercentage :input")[0]).val());
    if (!Number.isNaN(gst)) {
        facade.UpdateGSTPercentage(gst);
    }
}

/**
 * InstallUpdate - Restarts the application
 */
function InstallUpdate() {
    window.app.relaunch();
    window.app.quit();
}

/**
 * initiateController - Initiates the controller
 *
 * @return {Object}  Settings controller
 */
function initiateController() {
    return require('../scripts/Facade.js').then(function(data) {
        facade = data;
        return ctrl;
    });
}

module.exports = initiateController();
