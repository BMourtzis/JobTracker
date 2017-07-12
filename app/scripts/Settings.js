var settingsPath = path.resolve(app.getPath('userData'), "Data/settings.json");

var settingsData = {};

function loadSettings() {
    if (!fs.existsSync(settingsPath)) {
        createDefaultSettings();
    }

    settingsData = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    settingsData.settingsPath = settingsPath;
    return settingsData;
}

function createDefaultSettings() {
    var basePath = path.resolve(app.getPath('userData'), "Data");
    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath);
    }

    settingsData.GSTPercentage = 10;

    settingsData.InvoiceOutputPath = path.resolve(basePath, "invoice");
    if (!fs.existsSync(settingsData.InvoiceOutputPath)) {
        fs.mkdirSync(settingsData.InvoiceOutputPath);
    }

    settingsData.InvoiceTemplatePath = path.resolve(settingsData.InvoiceOutputPath, "Receipt_Template.docx");

    settingsData.BackupPath = path.resolve(basePath, "backup");
    if (!fs.existsSync(settingsData.BackupPath)) {
        fs.mkdirSync(settingsData.BackupPath);
    }

    var dbpath = path.resolve(basePath, "db");
    settingsData.dbFile = path.resolve(dbpath, "jobs.db");
    if (!fs.existsSync(dbpath)) {
        fs.mkdirSync(dbpath);
    }

    settingsData.dailyUpdate = "";
    settingsData.weeklyUpdate = "";

    writeSettings();
}

function writeSettings() {
    fs.writeFileSync(settingsPath, JSON.stringify(settingsData));
}

module.exports = loadSettings();
