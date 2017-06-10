require('electron').ipcRenderer.on('message', function(event, messageObj){
    $.notify({
        //options
        message: messageObj.message
    }, {
        //settings
        type: messageObj.msgtype,
        delay: messageObj.time,
        placements: {
            from: "top",
            align: "center"
        }
    });
});
