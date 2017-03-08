var facade;

var ctrl = {};

ctrl.ctrlName = "Jobs";
ctrl.templateDir = "../Templates/";

//Properties for searching
ctrl.currentPage = 0;
ctrl.searchParams = {};

//Properties for selection
ctrl.selectedList = [];

//TODO: Add ordering

//Creates the index page for Jobs and loads all the jobs
ctrl.index = function() {
    contentManager.restartLineup(ctrl.ctrlName, "index", ctrl.index.bind(this));
    return ctrl.initiateIndexPage().then(function(){
        return ctrl.loadAllJobs();
    });
};

//Adds the heading, buttons and the modal
ctrl.initiateIndexPage = function(){
    return facade.getAllClients().then(function(query) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/index.html");
        var temp = jsrender.templates(templatePath);
        var html = temp({clients: query});
        $("#content").html(html);

        $('#fromDatepicker').datetimepicker({format: 'DD/MM/YYYY'});
        $('#toDatepicker').datetimepicker({
            format: 'DD/MM/YYYY',
            useCurrent: false
        });

        $('#fromDatepicker').on("dp.change", function(e){
            $('#toDatepicker').data("DateTimePicker").minDate(e.date);
        });

        $('#toDatepicker').on("dp.change", function(e){
            $('#fromDatepicker').data("DateTimePicker").maxDate(e.date);
        });

        ctrl.currentPage = 0;
    });
};

//Queries all the jobs based on the client id
ctrl.getClientJobs = function(id){
    ctrl.initiatePage().then(function(){
        ctrl.searchParams = {clientID: id};
        facade.getClientJobs(ctrl.searchParams, "", ctrl.currentPage).then(function(data){
            ctrl.loadTable(data);
        });
    });
    contentManager.add(ctrl.ctrlName, "clientDetails", ctrl.getClientJobs.bind(this));
};

//Loads all Jobs
ctrl.loadAllJobs = function() {
    ctrl.searchParams = {
        from: Date.today().last().year().set({month: 0, day: 1}),
        to: Date.today().set({month: 11, day: 31}).at({hour: 23, minute: 59})
    };
    facade.searchJobs(ctrl.searchParams, "", ctrl.currentPage).then(function(query) {
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

    contentManager.add(ctrl.ctrlName, "search", ctrl.reloadSearch.bind(this));

    ctrl.searchParams = formData;
    return facade.searchJobs(ctrl.searchParams, "", ctrl.currentPage).then(function(data){
        ctrl.loadTable(data);
    });
};

ctrl.reloadSearch = function() {
    return facade.searchJobs(ctrl.searchParams, "", ctrl.currentPage).then(function(data){
        ctrl.loadTable(data);
    });
};

//Updates the list of selected jobs
ctrl.updateSelectedList = function() {
    var tdList = $("#indexJobTable :checked");
    ctrl.selectedList = [];

    tdList.each(function(){
        ctrl.selectedList.push(parseInt($(this).val()));
    });

    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/selectedListOptions.html");
    var temp = jsrender.templates(templatePath);
    var html = temp({count: ctrl.selectedList.length});
    sidebarManager.add(ctrl.ctrlName, "updateSelectedList", ctrl.updateSelectedList.bind(this));
    $("#sidebar-heading").html("Selection List");
    $("#sidebar").html(html);
};

//Updates all the checkboxes depending on the top one, and then updates the list
ctrl.updateAllCheckboxes = function() {
    var checked = $("#jobAllCheckbox").is(":checked");
    var tdList = $("#indexJobTable :checkbox");

    tdList.each(function(){
        $(this).prop("checked", checked);
    });

    ctrl.updateSelectedList();
};

//Loads the next page of the table
ctrl.gotoPage = function(page) {
    ctrl.currentPage = page;
    return ctrl.reloadSearch();
};

//Generates the table with the data given
ctrl.loadTable = function(data){
    data.currentPage = ctrl.currentPage;

    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/table.html");
    var tableTemp = jsrender.templates(templatePath);
    var table = tableTemp(data);
    $("#indexJobTable").html(table);
};

//Gets the client details and loads them on the sidebar
ctrl.jobDetails = function(id) {
    facade.getJobFull(id).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/details.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);
        $("#sidebar-heading").html("Job Details");
        $("#sidebar").html(html);
    });

    sidebarManager.add(ctrl.ctrlName, "details", ctrl.jobDetails.bind(this), id);
};

//TODO: add an if statement for id before asking for data

//Creates the createJob page
ctrl.getCreateJob = function(id) {
    if(id === undefined) {
        return facade.getAllClients().then(function(query) {
            return fillCreatePage({clients: query});
        });
    }
    else {
        return facade.getClient(id).then(function(query) {
            return fillCreatePage({client: query});
        });
    }
};

function fillCreatePage(data) {
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/create.html");
    var temp = jsrender.templates(templatePath);
    var html = temp(data);

    sidebarManager.add(ctrl.ctrlName, "create", ctrl.getCreateJob.bind(this));
    $("#sidebar-heading").html("Create Job");
    $("#sidebar").html(html);

    $('#datepicker').datetimepicker({format: 'DD/MM/YYYY'});
    $('#timepicker').datetimepicker({format: 'HH:mm'});
}

//Creates a new job based on the fields and saves it in the db
ctrl.createJob = function() {
    var formData = $("#createJobForm").serializeArray();
    var date = $('#datepicker :input').val();
    var time = $('#timepicker :input').val();
    var dateTimeFormat = "DD/MM/YYYY HH:mm";

    formData.push(moment(date+" "+time, dateTimeFormat)._d);
    facade.createJob(formData[1].value, formData[3], formData[2].value, formData[0].value).then(function(job) {
        sidebarManager.pop();
        contentManager.reload();
        ctrl.jobDetails(job.id);
    });
};

//Deletes the selected Job
ctrl.removeJob = function(id, clientID) {
    facade.removeJob(id).then(function() {
        sidebarManager.goBack();
    });
};

ctrl.bulkDelete = function() {
    facade.bulkDeleteJobs(ctrl.selectedList).then(function(){
        contentManager.reload().then(function(){
            ctrl.updateSelectedList();
        });
    });
};

//Creates the edit details page
ctrl.getEditJob = function(id) {
    facade.getJob(id).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/edit.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);

        sidebarManager.add(ctrl.ctrlName, "edit", ctrl.getEditJob.bind(this), id);
        $("#sidebar-heading").html("Edit Job");
        $("#sidebar").html(html);
    });
};

//Updates the details of the job based on the edits made
ctrl.editJob = function(id) {
    var formData = $("#editJobForm").serializeArray();
    formData[1].value = parseFloat(formData[1].value);
    facade.editJob(id, formData).then(function() {
        sidebar.pop();
        contentManager.reload();
        ctrl.jobDetails(id);
    });
};

//Creates the Rebook job page
ctrl.getRebookJob = function(id) {
    facade.getJob(id).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/rebook.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);

        sidebarManager.add(ctrl.ctrlName, "rebook", ctrl.getRebookJob.bind(this), id);
        $("#sidebar-heading").html("Rebook Job");
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
    facade.editJob(id, formData).then(function() {
        sidebarManager.pop();
        contentManager.reload();
        ctrl.jobDetails(id);
    });
};

//State Machine
ctrl.placed = function(id){
    facade.placed(id).then(function(data){
        ctrl.jobDetails(id);
    });
};

ctrl.done = function(id){
    facade.done(id).then(function(data){
        ctrl.jobDetails(id);
    });
};

//List State Machine
ctrl.jobListPlaced = function() {
    facade.jobListPlaced(ctrl.selectedList);
    sidebarManager.pop();
    contentManager.reload();
};

ctrl.jobListDone = function() {
    facade.jobListDone(ctrl.selectedList);
    sidebarManager.pop();
    contentManager.reload();
};

module.exports = function getController() {
    return require('../scripts/Facade.js')().then(function(data){
        facade = data;
        return ctrl;
    });
};
