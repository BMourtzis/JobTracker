var ctrl = {};

ctrl.ctrlName = "Jobs";
ctrl.templateDir = "./app/Templates/";

//Properties for searching
ctrl.currentPage = 0;
ctrl.searchParams = {};

//Properties for selection
ctrl.selectedList = [];

//TODO: Add multiple selection
//TODO: Add ordering

//Creates the index page for Jobs and loads all the jobs
ctrl.index = function() {
    ctrl.initiatePage().then(function(){
        ctrl.loadAllJobs();
    });
};

//Adds the heading, buttons and the modal
ctrl.initiatePage = function(){
    return facade.getAllClients().then(function(query) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/index.html');
        var html = temp({clients: query});
        $("#content").html(html);

        $('#fromDatepicker').datetimepicker({format: 'DD/MM/YYYY'});
        $('#toDatepicker').datetimepicker({format: 'DD/MM/YYYY'});

        ctrl.currentPage = 0;
    });
};

//Queries all the jobs based on the client id
ctrl.getClientJobs = function(id){
    ctrl.initiatePage().then(function(){
        ctrl.searchParams = {clientSelect: id};
        facade.FindJobs(ctrl.searchParams, {}, ctrl.currentPage).then(function(data){
            ctrl.loadTable(data);
        });
    });
};

//Loads all Jobs
ctrl.loadAllJobs = function(){
    facade.getAllJobs().then(function(query) {
        ctrl.loadTable(query);
    });
};

//Searches for the Jobs with the given parameters
ctrl.searchJobs = function() {
    ctrl.currentPage = 0;

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

    ctrl.searchParams = formData;
    facade.searchJobs(ctrl.searchParams, {}, ctrl.currentPage).then(function(data){
        ctrl.loadTable(data);
    });
};

ctrl.updateSelectedList = function() {
    var tdList = $("#indexJobTable :checked");
    ctrl.selectedList = [];
    for(var i = 0; i < tdList.length; i++){
        ctrl.selectedList.push(parseInt($(tdList[i]).val()));
    }

    var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/selectedListOptions.html');
    var html = temp({count: ctrl.selectedList.length});
    $("#sidebar").html(html);

};

//Loads the next page of the table
ctrl.gotoPage = function(page) {
    ctrl.currentPage = page;
    facade.FindJobs(ctrl.searchParams, {}, ctrl.currentPage).then(function(data){
        ctrl.loadTable(data);
    });
};

//Generates the table with the data given
ctrl.loadTable = function(data){
    data.currentPage = ctrl.currentPage;

    var tableTemp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/table.html');
    var table = tableTemp(data);
    $("#indexJobTable").html(table);
};

//Gets the client details and loads them on the sidebar
ctrl.jobDetails = function(id) {
    facade.getJobFull(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/details.html');
        var html = temp(data);
        $("#sidebar").html(html);
    });
};

//Creates the createJob page
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

//Creates a new job based on the fields and saves it in the db
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

//Deletes the selected Job
ctrl.removeJob = function(id, clientID) {
    facade.removeJob(id).then(function() {
        UIFunctions.clientDetails(clientID);
    });
};

ctrl.bulkDelete = function() {
    facade.bulkDeleteJobs(ctrl.selectedList);
};

//Creates the edit details page
ctrl.getEditJob = function(id) {
    facade.getJob(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/edit.html');
        var html = temp(data);
        $("#sidebar").html(html);
    });
};

//Updates the details of the job based on the edits made
ctrl.editJob = function(id) {
    var formData = $("#editJobForm").serializeArray();
    facade.editJob(id, formData);
};

//Creates the Rebook job page
ctrl.getRebookJob = function(id) {
    facade.getJob(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir + ctrl.ctrlName + '/rebook.html');
        var html = temp(data);
        $("#sidebar").html(html);

        $('#datepicker').datetimepicker({format: 'DD/MM/YYYY'});
        $('#timepicker').datetimepicker({format: 'HH:mm'});
    });
};

//Rebooks a job
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

//List State Machine
ctrl.jobListDone = function() {
    facade.jobListDone(ctrl.selectedList);
};

ctrl.jobListInvoiced = function() {
    facade.jobListInvoiced(ctrl.selectedList);
};

ctrl.jobListPaid = function() {
    facade.jobListPaid(ctrl.selectedList);
};

module.exports = ctrl;
