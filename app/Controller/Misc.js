// var facade = require('../scripts/Facade.js');

var ctrl = {};

ctrl.ctrlName = "Misc";
ctrl.templateDir = "../Templates/";

ctrl.comingsoon = function(){
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/comingsoon.html");
    var temp = jsrender.templates(templatePath);
    var html = temp();
    $("#content").html(html);
};

module.exports = ctrl;
