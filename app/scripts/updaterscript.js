var autoUpdater = require("electron-updater").autoUpdater;
let main;

autoUpdater.on('checking-for-update', function() {
    main.webContents.send("message", {
        message: "Checking for updates",
        msgtype: "info",
        time: "3000"
    });
});

autoUpdater.on('update-available', function(ev, info) {
    main.webContents.send("message", {
        message: "Update available",
        msgtype: "info",
        time: "3000"
    });
});

autoUpdater.on('download-progress', function(progressInfo) {
    main.webContents.send("message", {
        message: "download in progress." +progressInfo.percent+ "% completed.",
        msgtype: "info",
        time: "10"
    });
});

autoUpdater.on('update-downloaded', function(ev, info) {
    main.webContents.send("message", {
        message: "Download completed. JobTracker will quit and install the new update",
        msgtype: "info",
        time: "3000"
    });
    setTimout(function() {
        autoUpdater.quitAndInstall();
    }, 5000);
});

function initiateUpdater(mainWindow) {
    main = mainWindow;
    autoUpdater.checkForUpdates();
        // main.webContents.send("message", {
        //     message: "Checking for updates",
        //     msgtype: "info"
        // });
}

module.exports = initiateUpdater;
