var facade;
var dialog = require('electron').remote.dialog;

var ctrl = {};

ctrl.ctrlName = "Settings";
ctrl.templateDir = "../Templates/";
ctrl.tempSettings;

/**
 * ctrl.index - Loads the settings page on the content div
 */
ctrl.index = function() {
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/index.html");
    var temp = jsrender.templates(templatePath);
    ctrl.tempSettings = Object.create(settings);

    ctrl.tempSettings.updateReady = window.updateReady;
    ctrl.tempSettings.version = app.getVersion();

    var html = temp(ctrl.tempSettings);
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
    $("#update-version-button").click(function(){
        InstallUpdate();
    });

    $("#undo-changes-settings-button").click(function(){
        ctrl.index();
    });

    $("#save-changes-button").click(function() {
        saveChanges();
    });

    contentManager.restartLineup(ctrl.ctrlName, "index", ctrl.index.bind(this));
};

/**
 * UpdateInvoiceTemplatePath - Updates the Invoice Template Path input field
 */
function UpdateInvoiceTemplatePath() {
    var dialogReturn = dialog.showOpenDialog({
        defaultPath: settings.InvoiceTemplatePath,
        properties: ['openFile']
    });
    if (dialogReturn !== undefined) {
        var path = dialogReturn[0];
        ctrl.tempSettings.InvoiceTemplatePath = path;
        $($("#InvoiceTemplatePath :input")[0]).val(path);
    }
}

/**
 * UpdateInvoiceOutputPath - Updates the Invoice Output Path input field
 */
function UpdateInvoiceOutputPath() {
    var dialogReturn = dialog.showOpenDialog({
        defaultPath: settings.InvoiceOutputPath,
        properties: ['openDirectory']
    });
    if (dialogReturn !== undefined) {
        var path = dialogReturn[0];
        ctrl.tempSettings.InvoiceOutputPath = path;
        $($("#InvoiceOutputPath :input")[0]).val(path);
    }
}

/**
 * UpdateBackupPath - Updates the Backup Path input field
 */
function UpdateBackupPath() {
    var dialogReturn = dialog.showOpenDialog({
        defaultPath: settings.BackupPath,
        properties: ['openDirectory']
    });
    if (dialogReturn !== undefined) {
        var path = dialogReturn[0];
        ctrl.tempSettings.BackupPath = path;
        $($("#BackupPath :input")[0]).val(path);
    }
}

/**
 * saveChanges - Saves the changed fields
 */
function saveChanges() {
    var gst = parseInt($($("#GSTPercentage :input")[0]).val());
    if (!Number.isNaN(gst)) {
        ctrl.tempSettings.GSTPercentage = gst;
    }

    var changes = false;

    if(ctrl.tempSettings.InvoiceTemplatePath !== settings.InvoiceTemplatePath) {
        facade.UpdateInvoiceTemplatePath(ctrl.tempSettings.InvoiceTemplatePath);
        changes = true;
    }

    if(ctrl.tempSettings.InvoiceOutputPath !== settings.InvoiceOutputPath) {
        facade.UpdateInvoiceOutputPath(ctrl.tempSettings.InvoiceOutputPath);
        changes = true;
    }

    if(ctrl.tempSettings.BackupPath !== settings.BackupPath) {
        facade.UpdateBackupPath(ctrl.tempSettings.BackupPath);
        changes = true;
    }

    if(ctrl.tempSettings.GSTPercentage !== settings.GSTPercentage) {
        facade.UpdateGSTPercentage(ctrl.tempSettings.GSTPercentage);
        changes = true;
    }

    if(changes) {
        ctrl.index();
        $.notify({
            //options
            message: "Settings saved"
        }, {
            //settings
            type: "success",
            delay: 3000
        });
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
