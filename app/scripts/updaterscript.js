var autoUpdater = require("electron-updater");

autoUpdater.on('update-available', function(ev, info) {
    $.notify({
        //options
        message: "New Update available"
    }, {
        //settings
        type: "info",
        delay: 3000,
        placement: {
            from: "bottom",
            align: "center"
        },
    });
});

autoUpdater.on('download-progress', functino(progressInfo) {
    $.notify({
        //options
        message: "Download in Progress .." + progressInfo.percent + "%";
    }, {
        //settings
        type: "info",
        delay: 100,
        placement: {
            from: "bottom",
            align: "center"
        },
    });
});

autoUpdater.on('update-downloaded', function(ev, info) {
    $.notify({
        //options
        message: "Updated Downloaded, will install in 5 seconds."
    }, {
        //settings
        type: "success",
        delay: 100,
        placement: {
            from: "bottom",
            align: "center"
        },
    });
    // setTimout(function() {
    //     autoUpdater.quitAndInstall();
    // }, 5000);
});

function initiateUpdater() {
    autoUpdater.checkForUpdates();
}

module.exports = initiateUpdater;
