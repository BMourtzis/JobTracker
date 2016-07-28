var ctrl = { }

ctrl.ctrlName = "Home";
ctrl.templateDir = "./app/Templates/";

ctrl.index = function() {
    orm.getClient(1).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName+'.html');
        var jobs = data.get({plain:true });
        var html = temp(jobs);
        $("#content").html(html);
    });
}

module.exports = ctrl;
