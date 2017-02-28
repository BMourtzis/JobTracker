var register = {};

var settingsPath = path.resolve(__dirname, "../../..", "settings.json");

register.loadSettings = function(){
    if(!fs.existsSync(settingsPath)) {
        register.createDefaultSettings();
    }
    register.settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    window.settings = register.settings;
};

register.UpdateInvoiceTemplatePath = function(path){
    register.settings.InvoiceTemplatePath = path;
    register.writeSettings();
};

register.UpdateInvoiceOutputPath = function(path){
    register.settings.InvoiceOutputPath = path;
    register.writeSettings();
};

register.UpdateBackupPath = function(path){
    register.settings.BackupPath = path;
    register.writeSettings();
};

register.UpdateGSTPercentage = function(gst){
    register.settings.GSTPercentage = gst;
    register.writeSettings();
};

register.writeSettings = function(){
    window.settings = register.settings;
    fs.writeFileSync(settingsPath, JSON.stringify(register.settings));
};

register.createDefaultSettings = function(){
    var basePath =  path.resolve(__dirname, "../../..");

    register.settings.InvoiceOutputPath = path.resolve(basePath, "invoice");
    if(!fs.existsSync(register.settings.InvoiceOutputPath)) {
        fs.mkdirSync(register.settings.InvoiceOutputPath);
    }

    register.settings.BackupPath = path.resolve(basePath, "backup");
    if(!fs.existsSync(register.settings.BackupPath)) {
        fs.mkdirSync(register.settings.BackupPath);
    }
    
    register.writeSettings();
};

module.exports = function() {
    register.loadSettings();
    return register;
};
