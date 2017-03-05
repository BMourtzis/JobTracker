var facade;

var ctrl = { };

ctrl.ctrlName = "Home";
ctrl.templateDir = "../Templates/";
ctrl.selectedDate = Date.today();

//TODO: fix daily schedule heading
//Renders the index page for Home
ctrl.index = function() {
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/index.html");

    var temp = jsrender.templates(templatePath);
    var html = temp();
    $("#content").html(html);

    ctrl.selectedDate = Date.today();
    ctrl.loadDayJobs();

    contentManager.restartLineup(ctrl.ctrlName, "index", ctrl.index.bind(this));
};

//Loads day jobs for the selectedDate of the object
ctrl.loadDayJobs = function() {
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
    });
};

//Goes to the next day
ctrl.nextDay = function(){
    ctrl.selectedDate.add(1).day();
    ctrl.loadDayJobs();

    contentManager.add(ctrl.ctrlName, ctrl.nextDay.bind(this));
};

//Goes to the previous day
ctrl.previousDay = function(){
    ctrl.selectedDate.add(-1).day();
    ctrl.loadDayJobs();

    contentManager.add(ctrl.ctrlName, ctrl.previousDay.bind(this));
};

//Changes the status of a job to placed
ctrl.placed = function(id){
    facade.placed(id).then(function(){
        ctrl.loadDayJobs();
    });
};

//Changes the status of a job to done
ctrl.done = function(id){
    facade.done(id).then(function(data){
        ctrl.loadDayJobs();
    });
};

module.exports = function getController() {
    return require('../scripts/Facade.js')().then(function(data){
        facade = data;
        return ctrl;
    });
};
