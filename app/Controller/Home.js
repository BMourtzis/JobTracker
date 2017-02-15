var ctrl = { };

ctrl.ctrlName = "Home";
ctrl.templateDir = "./app/Templates/";

//TODO: Add functionlity to reload the specific date viewed

ctrl.index = function() {
    var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName+'/index.html');
    var html = temp();
    $("#content").html(html);

    ctrl.loadTodaysJobs();
};

ctrl.loadTodaysJobs = function() {
    facade.getTodaysJobs().then(function(data){
        ctrl.loadTable({jobs: data});
    });
};

ctrl.loadTable = function(data){
    var tableTemp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/table.html');
    var table = tableTemp(data);
    $("#homeDailyTable").html(table);
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
