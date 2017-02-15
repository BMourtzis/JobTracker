var ctrl = {};

ctrl.ctrlName = "Jobs";
ctrl.templateDir = "./app/Templates/";

ctrl.index = function() {
    facade.getAllJobs().then(function(query) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/index.html');
        var data = {
            jobs:query
        };
        var html = temp();
        $("#content").html(html);

        var tableTemp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/table.html');
        var table = tableTemp(data);
        $("#indexJobTable").html(table);

        //Find a way to get details and select several rows
        $(".clickable-row").click(function() {
            var id = $(this).data("id");
            ctrl.jobDetails(id);
        });
    });
};

ctrl.jobDetails = function(id) {
    facade.getJobFull(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/details.html');
        var html = temp(data);
        $("#sidebar").html(html);
    });
};

ctrl.getCreateJob = function(id) {
    facade.getAllClients().then(function(query) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/create.html');
        var data = {
            clients: query
        };

        if(id !== null)
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
};

ctrl.createJob = function() {
    var formData = $("#createJobForm").serializeArray();
    var date = $('#datepicker :input').val();
    var time = $('#timepicker :input').val();
    var dateTimeFormat = "DD/MM/YYYY HH:mm";

    formData.push(moment(date+" "+time, dateTimeFormat)._d);
    facade.createJob(formData[1].value, formData[3], formData[2].value, formData[0].value).then(function(job) {
        ctrl.jobDetails(job.id);
    });
};

ctrl.removeJob = function(id, clientID) {
    facade.removeJob(id).then(function() {
        UIFunctions.clientDetails(clientID);
    });
};

ctrl.getEditJob = function(id) {
    facade.getJob(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/edit.html');
        var html = temp(data);
        $("#sidebar").html(html);
    });
};

ctrl.editJob = function(id) {
    var formData = $("#editJobForm").serializeArray();
    facade.editJob(id, formData);
};

ctrl.getRebookJob = function(id) {
    facade.getJob(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/rebook.html');
        var html = temp(data);
        $("#sidebar").html(html);

        $('#datepicker').datetimepicker({format: 'DD/MM/YYYY'});
        $('#timepicker').datetimepicker({format: 'HH:mm'});
    });
};

ctrl.rebookJob = function(id){
    var formData = [];
    var date = $('#datepicker :input').val();
    var time = $('#timepicker :input').val();
    var dateTimeFormat = "DD/MM/YYYY HH:mm";

    formData.push({
        name: "timeBooked",
        value: moment(date+" "+time, dateTimeFormat)._d
    });
    facade.editJob(id, formData);
};

module.exports = ctrl;
