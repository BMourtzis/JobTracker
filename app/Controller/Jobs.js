var ctrl = {}

ctrl.ctrlName = "Jobs";
ctrl.templateDir = "./app/Templates/";

ctrl.index = function() {
    orm.getAllJobs().then(function(query) {
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
            ctrl.jobDetails(id);
        });
    });
}

ctrl.jobDetails = function(id) {
    orm.getJob(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/details.html');
        var job = data.get({
            plain: true
        });
        var html = temp(job);
        $("#sidebar").html(html);
    });
}

ctrl.getCreateJob = function(id) {
    orm.getAllClients().then(function(query) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/create.html');
        var data = {
            clients: new Array()
        };

        for (var i = 0; i < query.length; i++) {
            data.clients.push(query[i].get({
                plain: true
            }));
        };
        if(id != null)
        {
            for (var i = 0; i < data.clients.length; i++) {
                if(data.clients[i].id == id)
                {
                    data.client = data.clients[i];
                    break;
                }
            }
        }

        var html = temp(data);
        $("#sidebar").html(html);

        $('#datepicker').datetimepicker({format: 'DD/MM/YYYY'});
        $('#timepicker').datetimepicker({format: 'HH:mm'});
    });
}

ctrl.createJob = function() {
    var formData = $("#createJobForm").serializeArray();
    var date = $('#datepicker :input').val();
    var time = $('#timepicker :input').val();
    var dateTimeFormat = "DD/MM/YYYY HH:mm";
    formData.push(moment(date+" "+time, dateTimeFormat)._d);
    console.log(formData);
    orm.createJob(formData[1].value, formData[3], formData[2].value, formData[0].value).then(function() {
        ctrl.index();
    });
}

ctrl.getEditJob = function(id) {
    orm.getJob(id).then(function(data) {
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
