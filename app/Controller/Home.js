var facade = require('../scripts/Facade.js');

var ctrl = { };

ctrl.ctrlName = "Home";
ctrl.templateDir = "./app/Templates/";
ctrl.selectedDate = Date.today();

//Renders the index page for Home
ctrl.index = function() {
    var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName+'/index.html');
    var html = temp();
    $("#content").html(html);

    ctrl.selectedDate = Date.today();
    ctrl.loadDayJobs();
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

        var tableTemp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/table.html');
        var table = tableTemp(data);
        $("#homeDailyTable").html(table);
    });
};

//Goes to the next day
ctrl.nextDay = function(){
    ctrl.selectedDate.add(1).day();
    ctrl.loadDayJobs();
};

//Goes to the previous day
ctrl.previousDay = function(){
    ctrl.selectedDate.add(-1).day();
    ctrl.loadDayJobs();
};

//Changes the status of a job to done
ctrl.done = function(id){
    facade.done(id).then(function(data){
        ctrl.loadDayJobs();
    });
};

//Changes the status of a job to placed
ctrl.placed = function(id){
    facade.placed(id).then(function(){
        ctrl.loadDayJobs();
    });
};

module.exports = ctrl;
