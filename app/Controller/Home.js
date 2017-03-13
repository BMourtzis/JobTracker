var facade;

var ctrl = { };

ctrl.ctrlName = "Home";
ctrl.templateDir = "../Templates/";
ctrl.selectedDate = Date.today();

//Renders the index page for Home
ctrl.index = function() {
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/index.html");

    var temp = jsrender.templates(templatePath);
    var html = temp();
    $("#content").html(html);

    ctrl.selectedDate = Date.today();
    loadDayJobs();

    contentManager.restartLineup(ctrl.ctrlName, "index", ctrl.index.bind(this));
};

//Loads day jobs for the selectedDate of the object
function loadDayJobs() {
    facade.getDayJobs(ctrl.selectedDate).then(function(data){
        data.selectedDay = ctrl.selectedDate.toString("dd/MM/yyyy");
        data.next = new Date(ctrl.selectedDate).add(1).day().toString("dd/MM/yyyy");
        data.previous = new Date(ctrl.selectedDate).add(-1).day().toString("dd/MM/yyyy");

        data.sum = 0;

        for(var i = 0; i < data.jobs.length; i++){
            data.sum += data.jobs[i].payment + data.jobs[i].gst;
        }

        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/table.html");

        var tableTemp = jsrender.templates(templatePath);
        var table = tableTemp(data);
        $("#homeDailyTable").html(table);

        $("#prev-day-button").click(function(){previousDay();});
        $("#reload-day-button").click(function(){loadDayJobs();});
        $("#next-day-button").click(function(){nextDay();});
        $(".placed").click(function(){done($(this).data("id"));});
        $(".done").click(function(){placed($(this).data("id"));});
        $("#home-job-table button").click(function(){ctrls.Jobs.details($(this).data("id"));});
    });
}

//Goes to the next day
function nextDay(){
    ctrl.selectedDate.add(1).day();
    loadDayJobs();

    contentManager.add(ctrl.ctrlName, "loadDayJobs", loadDayJobs.bind(this));
}

//Goes to the previous day
function previousDay(){
    ctrl.selectedDate.add(-1).day();
    loadDayJobs();

    contentManager.add(ctrl.ctrlName, "loadDayJobs", loadDayJobs.bind(this));
}

//Changes the status of a job to placed
function placed(id){
    facade.placed(id).then(function(){
        loadDayJobs();
    });
}

//Changes the status of a job to done
function done(id){
    facade.done(id).then(function(data){
        loadDayJobs();
    });
}

module.exports = function getController() {
    return require('../scripts/Facade.js')().then(function(data){
        facade = data;
        return ctrl;
    });
};
