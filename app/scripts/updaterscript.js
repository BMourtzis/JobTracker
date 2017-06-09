var autoUpdater = require("electron-updater").autoUpdater;

console.log(autoUpdater);

autoUpdater.on('checking-for-updates', function() {
    $.notify({
        //options
        message: "Checking for Updates"
    }, {
        //settings
        type: "info",
        delay: 3000
    });
});

autoUpdater.on('update-available', function(ev, info) {
    $.notify({
        //options
        message: "New Update available"
    }, {
        //settings
        type: "info",
        delay: 3000
    });
});

autoUpdater.on('download-progress', function(progressInfo) {
    $.notify({
        //options
        message: "Download in Progress .." + progressInfo.percent + "%"
    }, {
        //settings
        type: "info",
        delay: 100
    });
});

autoUpdater.on('update-downloaded', function(ev, info) {
    $.notify({
        //options
        message: "Updated Downloaded, will install in 5 seconds."
    }, {
        //settings
        type: "success",
        delay: 100
    });
    // setTimout(function() {
    //     autoUpdater.quitAndInstall();
    // }, 5000);
});

function initiateUpdater() {
    autoUpdater.checkForUpdates();
}

module.exports = initiateUpdater;
