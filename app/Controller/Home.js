var ctrl = { };

ctrl.ctrlName = "Home";
ctrl.templateDir = "./app/Templates/";

ctrl.index = function() {
    facade.getClient(1).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName+'/index.html');
        var html = temp(data);
        $("#content").html(html);
    });
};

module.exports = ctrl;
