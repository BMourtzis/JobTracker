var register = {};

register.settings = { };

function initiate() {
    register.settings = settings;
    return register;
}

register.UpdateInvoiceTemplatePath = function(path) {
    register.settings.InvoiceTemplatePath = path;
    register.writeSettings();
};

register.UpdateInvoiceOutputPath = function(path) {
    register.settings.InvoiceOutputPath = path;
    register.writeSettings();
};

register.UpdateBackupPath = function(path) {
    register.settings.BackupPath = path;
    register.writeSettings();
};

register.UpdateGSTPercentage = function(gst) {
    register.settings.GSTPercentage = gst;
    register.writeSettings();
};

register.writeSettings = function(){
    window.settings = register.settings;
    fs.writeFileSync(settings.settingsPath, JSON.stringify(register.settings));
};

module.exports = initiate();
