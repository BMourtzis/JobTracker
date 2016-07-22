var controller = { }

controller.ctrlName = "Home";
controller.templateDir = "../Templates/";

controller.getData = function() {
    orm.getClient(1).then(function(data) {
        controller.Jobs = data;
        //var temp = jsrender.templates("Id: {{:id}}");
        // var temp = jsrender.templates(controller.templateDir+controller.ctrlName+'.html');
        var temp = jsrender.templates('./app/Templates/Home.html');
        var jobs = data.get({plain:true });
        var html = temp(jobs);
        $("#content").html(html);
    });
}

controller.getData();
