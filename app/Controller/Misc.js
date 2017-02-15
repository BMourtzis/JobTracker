var ctrl = {};

ctrl.ctrlName = "Misc";
ctrl.templateDir = "./app/Templates/";

ctrl.comingsoon = function(){
    var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/comingsoon.html');
    var html = temp();
    $("#content").html(html);
};

module.exports = ctrl;
