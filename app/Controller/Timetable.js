var facade;

var ctrl = {};

ctrl.ctrlName = "Timetable";
ctrl.templateDir = "../Templates/";
var selectedDate;

var calendarSettings = {
    header: {
        left: 'prev, next, today',
        center: 'title',
        right: 'month, basicWeek, basicDay'
    },
    aspectRatio: 1,
    events: [],
    timeFormat: 'HH:mm',
    eventClick: function(calEvent, jsEvent, view) {
        ctrls.Jobs.details(calEvent.jobId);
    }
}

/**
 * ctrl.index - Renders the index page for Timteable
 *
 * @return Nothing
 */
ctrl.index = function() {
    contentManager.restartLineup(ctrl.ctrlName, "index", ctrl.index.bind(this));
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/index.html");

    var temp = jsrender.templates(templatePath);
    var html = temp();
    $("#content").html(html);

    $("#calendar").fullCalendar(calendarSettings);
    selectedDate = Date.today();
    loadEvents();

    $('.fc-prev-button').click(function() {
        selectedDate.add(-1).month();
        loadEvents(selectedDate);
    });

    $('.fc-next-button').click(function() {
        selectedDate.add(1).month();
        loadEvents(selectedDate);
    });
}

function loadEvents() {
    console.log(selectedDate);
    return facade.getJobsForMonth(selectedDate).then(function(data) {
        var events = [];
        for(var i = 0; i < data.length; i++)
        {
            events.push({
                jobId: data[i].id,
                title: data[i].client.shortName,
                start: data[i].timeBooked
            })
        }

        $("#calendar").fullCalendar('renderEvents', events);
    });
}

function initaitesController() {
    return require('../scripts/Facade.js').then(function(data) {
        facade = data;
        return ctrl;
    });
}

module.exports = initaitesController();
