var ctrl = { };

ctrl.ctrlName = "Home";
ctrl.templateDir = "./app/Templates/";
ctrl.selectedDate = Date.today();

//TODO: Add functionlity to reload the specific date viewed

ctrl.index = function() {
    var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName+'/index.html');
    var html = temp();
    $("#content").html(html);

    ctrl.selectedDate = Date.today();
    ctrl.loadDayJobs();
};

ctrl.loadDayJobs = function() {
    facade.getTodaysJobs(ctrl.selectedDate).then(function(query){
        var data = {
            jobs: query,
            selectedDay: ctrl.selectedDate.toString("dd/MM/yyyy"),
            next: new Date(ctrl.selectedDate).add(1).day().toString("dd/MM/yyyy"),
            previous: new Date(ctrl.selectedDate).add(-1).day().toString("dd/MM/yyyy")
        };
        var tableTemp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/table.html');
        var table = tableTemp(data);
        $("#homeDailyTable").html(table);
    });
};

ctrl.nextDay = function(){
    ctrl.selectedDate.add(1).day();
    ctrl.loadDayJobs();
};

ctrl.previousDay = function(){
    ctrl.selectedDate.add(-1).day();
    ctrl.loadDayJobs();
};

ctrl.Done = function(id){
    facade.Done(id).then(function(data){
        ctrl.loadTodaysJobs();
    });
};

ctrl.Undone = function(id){
    facade.Undone(id).then(function(){
        ctrl.loadTodaysJobs();
    });
};

module.exports = ctrl;
