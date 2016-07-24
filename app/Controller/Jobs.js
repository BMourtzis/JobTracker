var ctrl = {}

ctrl.ctrlName = "Jobs";
ctrl.templateDir = "./app/Templates/";

ctrl.index = function() {
    orm.getAllClients().then(function(query) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/index.html');
        var data = {
            jobs: new Array()
        };
        for (var i = 0; i < query.length; i++) {
            data.jobs.push(query[i].get({
                plain: true
            }));
        }
        var html = temp(data);
        $("#content").html(html);

        $(".clickable-row").click(function() {
            var id = $(this).data("id");
            //ctrl.clientDetails(id);
        });
    });
}

ctrl.clientDetails = function(id) {
    orm.getClient(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/details.html');
        var client = data.get({
            plain: true
        });
        var html = temp(client);
        $("#sidebar").html(html);
    });
}

ctrl.getCreateJob = function() {
    var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/create.html');
    $("#sidebar").html(temp);
    $('#datepicker').datetimepicker({format: 'DD/MM/YYYY'});
    $('#timepicker').datetimepicker({format: 'HH:mm'});
}

ctrl.createJob = function() {
    var formData = $("#createJobForm").serializeArray();
    console.log(formData);
    // orm.createClient(formData[2].value, formData[3].value, formData[0].value, formData[1].value, formData[4].value, formData[5].value, formData[6].value).then(function() {
    //     ctrl.index();
    // });
}

ctrl.getEditClient = function(id) {
    orm.getClient(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/edit.html');
        var client = data.get({
            plain: true
        });
        var html = temp(client);
        $("#sidebar").html(html);
    });
}

ctrl.editClient = function(id) {
    var formData = $("#editClientForm").serializeArray();
    orm.editClient(id, formData);
}

module.exports = ctrl;
