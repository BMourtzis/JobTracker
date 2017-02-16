var ctrl = {};

ctrl.ctrlName = "Jobs";
ctrl.templateDir = "./app/Templates/";

//TODO: Add advance searching functionality
//TODO: Add multiple selection
//TODO: Add state change
//TODO: Add pagination

ctrl.index = function() {
    facade.getAllClients().then(function(query) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/index.html');
        var html = temp({clients: query});
        $("#content").html(html);

        $('#fromDatepicker').datetimepicker({format: 'DD/MM/YYYY'});
        $('#toDatepicker').datetimepicker({format: 'DD/MM/YYYY'});

        ctrl.loadAllJobs();
    });
};

ctrl.loadAllJobs = function(){
    facade.getAllJobs().then(function(query) {
        ctrl.loadTable(query);
    });
};

ctrl.loadTable = function(data){
    var tableTemp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/table.html');
    var table = tableTemp({jobs: data});
    $("#indexJobTable").html(table);
};

ctrl.searchJobs = function() {
    var formData = $("#searchOptionsForm").serializeArray().reduce(function(obj, item) {
    obj[item.name] = item.value;
    return obj;
},{});

    if($('#fromDatepicker :input').val() !== "") {
        formData.from = Date.parse($('#fromDatepicker :input').val());
    }

    if($('#toDatepicker :input').val() !== "") {
        formData.to = Date.parse($('#toDatepicker :input').val());
    }

    formData.clientSelect = parseInt(formData.clientSelect);
    console.log(formData);
    facade.FindJobs(formData).then(function(data){
        console.log(data);
        ctrl.loadTable(data);
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

//State Machine
ctrl.done = function(id){
    facade.done(id).then(function(data){
        ctrl.jobDetails(id);
    });
};

ctrl.invoice = function(id) {
    facade.invoice(id).then(function(data){
        ctrl.jobDetails(id);
    });
};

ctrl.paid = function(id){
    facade.paid(id).then(function(data){
        ctrl.jobDetails(id);
    });
};

module.exports = ctrl;
