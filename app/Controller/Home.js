var ctrl = { };

ctrl.ctrlName = "Home";
ctrl.templateDir = "./app/Templates/";

ctrl.index = function() {
    var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName+'/index.html');
    var html = temp();
    $("#content").html(html);

    ctrl.loadTable();
};

ctrl.loadTable = function(){
    facade.getTodaysJobs().then(function(data){
        var tableTemp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/table.html');
        var table = tableTemp({jobs: data});
        $("#homeDailyTable").html(table);
    });
};

ctrl.Done = function(id){
    facade.Done(id).then(function(data){
        ctrl.loadTable();
    });
};

ctrl.Undone = function(id){
    facade.Undone(id).then(function(){
        ctrl.loadTable();
    });
};

module.exports = ctrl;
