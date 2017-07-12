var autoUpdater = require("electron-updater").autoUpdater;

let main;

autoUpdater.on('checking-for-update', function() {

});

autoUpdater.on('update-available', function(ev, info) {
    main.webContents.send("message", {
        message: "Update available",
        msgtype: "info",
        time: "3000"
    });
});

autoUpdater.on('download-progress', function(progressInfo) {

});

autoUpdater.on('update-downloaded', function(ev, info) {
    main.webContents.send('updateReady');
});

function initiateUpdater(mainWindow) {
    main = mainWindow;
    autoUpdater.checkForUpdates();
    return main;
}

module.exports = initiateUpdater;
