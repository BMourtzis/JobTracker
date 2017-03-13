var ctrl = {};

//initializes the script
function initiate() {
    checkForWeeklyBackup();
    checkForDailyBackup();
    return ctrl;
}

//Updates the db at the launch every week
function checkForWeeklyBackup() {
    var week = new Date.parse(settings.weeklyUpdate);
    var today = new Date.today();
    if(settings.weeklyUpdate === "" || (week.getISOWeek() !== today.getISOWeek())) {
        backup("weekly");
        updateWeeklyUpdate();
    }
}

//Updates the db at the first launch every day
function checkForDailyBackup() {
    var date = new Date.parse(settings.dailyUpdate);
    var day = date.toString("dd") !== new Date.today().toString("dd");
    var month = date.toString("MM") !== new Date.today().toString("MM");
    var year = date.toString("YYYY") !== new Date.today().toString("YYYY");
    if(settings.dailyUpdate === "" || (day || month || year)) {
        backup("daily");
        updateDailyUpdate();
    }
}

//Updates the db on every update
ctrl.updateBackup = function() {
    backup("regular");
};

//Updates the WeeklyUpdate field of the settings
function updateWeeklyUpdate() {
    settings.weeklyUpdate = new Date.today();
    writeDB();
}

//Updates DailyUpdate Field of the settings
function updateDailyUpdate() {
    settings.dailyUpdate = new Date.today();
    writeDB();
}

//Updates the settings.json file
function writeDB() {
    fs.writeFileSync(settings.settingsPath, JSON.stringify(settings));
}

//does the actual backup
function backup(name) {
    fs.createReadStream(settings.dbFile).pipe(fs.createWriteStream(path.resolve(settings.BackupPath, name+".db")));
}

module.exports = initiate();
