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

    applicationSettings();

    $("#application-nav-item").click(applicationSettings);
    $("#invoice-nav-item").click(invoiceSettings);
    $("#backup-nav-item").click(backupSettings);

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
 * applicationSettings - Renders the application section of the settings page
 */
function applicationSettings() {
    removeActiveNav();
    $("#application-nav-item").addClass("active");
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/application.html");
    var temp = jsrender.templates(templatePath);
    var html = temp(ctrl.tempSettings);
    $("#settings-content").html(html);

    $("#GSTPercentage").keyup(function(){
        UpdateGSTPercentage();
    })
}

/**
 * invoiceSettings - Renders the invoice section of the settings page
 */
function invoiceSettings() {
    removeActiveNav();
    $("#invoice-nav-item").addClass("active");
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/invoice.html");
    var temp = jsrender.templates(templatePath);
    var html = temp(ctrl.tempSettings);
    $("#settings-content").html(html);

    $("#InvoiceTemplatePath").click(function() {
        UpdateInvoiceTemplatePath();
    });
    $("#InvoiceOutputPath").click(function() {
        UpdateInvoiceOutputPath();
    });
}

/**
 * backupSettings - Renders the backup section of the settings page
 */
function backupSettings() {
    removeActiveNav();
    $("#backup-nav-item").addClass("active");
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/backup.html");
    var temp = jsrender.templates(templatePath);
    var html = temp(ctrl.tempSettings);
    $("#settings-content").html(html);

    $("#BackupPath").click(function() {
        UpdateBackupPath();
    });
}

function removeActiveNav() {
    $("#application-nav-item").removeClass("active");
    $("#invoice-nav-item").removeClass("active");
    $("#backup-nav-item").removeClass("active");
}

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

function UpdateGSTPercentage() {
    var gst = parseInt($($("#GSTPercentage :input")[0]).val());
    if (!Number.isNaN(gst)) {
        ctrl.tempSettings.GSTPercentage = gst;
    }
    else {
        $($("#GSTPercentage :input")[0]).val(ctrl.tempSettings.GSTPercentage);
    }
}

/**
 * saveChanges - Saves the changed fields
 */
function saveChanges() {
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
function initiateController(injFacade) {
    facade = injFacade;
    return ctrl;
}

module.exports = initiateController;
