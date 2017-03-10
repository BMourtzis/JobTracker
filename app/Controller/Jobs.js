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
    return initiatePage().then(function(){
        return loadAllJobs();
    });
};

//Adds the heading, buttons and the modal
function initiatePage(){
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

        $("#jobAllCheckbox").click(function(){updateAllCheckboxes();});
        $("#create-button").click(function(){ctrl.create();});
        $("#search-button").click(function(){search();});

        ctrl.currentPage = 0;
    });
}

//Queries all the jobs based on the client id
ctrl.getClientJobs = function(id) {
    contentManager.add(ctrl.ctrlName, "reload", reload.bind(this));
    return initiatePage().then(function(){
        ctrl.searchParams = {clientID: id};
        facade.getClientJobs(ctrl.searchParams, "", ctrl.currentPage).then(function(data){
            loadTable(data);
        });
    });
};

//Loads all Jobs
function loadAllJobs() {
    ctrl.searchParams = {
        from: Date.today().last().year().set({month: 0, day: 1}),
        to: Date.today().set({month: 11, day: 31}).at({hour: 23, minute: 59})
    };
    facade.searchJobs(ctrl.searchParams, "", ctrl.currentPage).then(function(query) {
        loadTable(query);
    });
}

//Searches for the Jobs with the given parameters
function search() {
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

    contentManager.add(ctrl.ctrlName, "search", search.bind(this));

    ctrl.searchParams = formData;
    return facade.searchJobs(ctrl.searchParams, "", ctrl.currentPage).then(function(data){
        loadTable(data);
    });
}

function reload() {
    return facade.searchJobs(ctrl.searchParams, "", ctrl.currentPage).then(function(data){
        loadTable(data);
    });
}

//Updates the list of selected jobs
    function updateSelectedList() {
    var tdList = $("#indexJobTable :checked");
    ctrl.selectedList = [];

    tdList.each(function(){
        ctrl.selectedList.push(parseInt($(this).data("id")));
    });

    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/selectedListOptions.html");
    var temp = jsrender.templates(templatePath);
    var html = temp({count: ctrl.selectedList.length});
    sidebarManager.add(ctrl.ctrlName, "updateSelectedList", updateSelectedList.bind(this));
    $("#sidebar-heading").html("Selection List");
    $("#sidebar").html(html);

    $("#delete-button").click(function(){bulkDelete();});
}

//Updates all the checkboxes depending on the top one, and then updates the list
function updateAllCheckboxes() {
    var checked = $("#jobAllCheckbox").is(":checked");
    var tdList = $("#indexJobTable :checkbox");

    tdList.each(function(){
        $(this).prop("checked", checked);
    });

    updateSelectedList();
}

//Loads the next page of the table
function gotoPage(page) {
    if(page !== undefined) {
        ctrl.currentPage = page;
        return reload();
    }
}

//Generates the table with the data given
function loadTable(data){
    data.currentPage = ctrl.currentPage;

    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/table.html");
    var tableTemp = jsrender.templates(templatePath);
    var table = tableTemp(data);
    $("#indexJobTable").html(table);

    $(".job-checkbox").click(function(){updateSelectedList();});
    $(".details-button").click(function(){ctrl.details($(this).data("id"));});
    $("#paginationNavBar li").click(function(){gotoPage($(this).data("page"));});
}

//Gets the client details and loads them on the sidebar
ctrl.details = function(id) {
    sidebarManager.add(ctrl.ctrlName, "details", ctrl.details.bind(this), id);
    return facade.getJobFull(id).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/details.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);
        $("#sidebar-heading").html("Job Details");
        $("#sidebar").html(html);

        $("#done-button").click(function(){done(id);});
        $("#placed-button").click(function(){placed(id);});
        $("#rebook-button").click(function(){ctrl.rebook(id);});
        $("#edit-button").click(function(){ctrl.edit(id);});
        $("#delete-button").click(function(){
            new Promise(function(resolve, reject){
                $("#deleteConfirmationModal").on('hidden.bs.modal', function (e) {
                    resolve();
                });
            }).then(function(){
                remove(data.id);
            });
        });
    });
};

//Creates the createJob page
ctrl.create = function(id) {
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

//Create the create page based on the data given
function fillCreatePage(data) {
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/create.html");
    var temp = jsrender.templates(templatePath);
    var html = temp(data);

    sidebarManager.add(ctrl.ctrlName, "create", ctrl.create.bind(this));
    $("#sidebar-heading").html("Create Job");
    $("#sidebar").html(html);

    $('#datepicker').datetimepicker({format: 'DD/MM/YYYY'});
    $('#timepicker').datetimepicker({format: 'HH:mm'});

    $("#form-submit-button").click(function(){create();});
}

//Creates a new job based on the fields
function create() {
    var formData = $("#createJobForm").serializeArray();
    var date = $('#datepicker :input').val();
    var time = $('#timepicker :input').val();
    var dateTimeFormat = "DD/MM/YYYY HH:mm";

    formData.push(moment(date+" "+time, dateTimeFormat)._d);
    facade.createJob(formData[1].value, formData[3], formData[2].value, formData[0].value).then(function(job) {
        sidebarManager.pop();
        contentManager.reload();
        ctrl.details(job.id);
    });
}

//Deletes the selected Job
function remove(id) {
    return facade.removeJob(id).then(function() {
        contentManager.reload();
        sidebarManager.goBack();
    });
}

function bulkDelete() {
    return facade.bulkDeleteJobs(ctrl.selectedList).then(function(){
        contentManager.reload().then(function(){
                updateSelectedList();
        });
    });
}

//Creates the edit details page
ctrl.edit = function(id) {
    facade.getJob(id).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/edit.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);

        sidebarManager.add(ctrl.ctrlName, "edit", ctrl.edit.bind(this), id);
        $("#sidebar-heading").html("Edit Job");
        $("#sidebar").html(html);

        $("#save-edit-button").click(function(){edit(id);});
    });
};

//Updates the details of the job based on the edits made
function edit(id) {
    var formData = $("#editJobForm").serializeArray();
    formData[1].value = parseFloat(formData[1].value);
    facade.editJob(id, formData).then(function() {
        sidebarManager.pop();
        contentManager.reload();
        ctrl.details(id);
    });
}

//Creates the Rebook job page
ctrl.rebook = function(id) {
    facade.getJob(id).then(function(data) {
        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/rebook.html");
        var temp = jsrender.templates(templatePath);
        var html = temp(data);

        sidebarManager.add(ctrl.ctrlName, "rebook", ctrl.rebook.bind(this), id);
        $("#sidebar-heading").html("Rebook Job");
        $("#sidebar").html(html);

        $('#datepicker').datetimepicker({format: 'DD/MM/YYYY'});
        $('#timepicker').datetimepicker({format: 'HH:mm'});

        $("#save-rebook-button").click(function(){rebook(id);});
    });
};

//Rebooks a job
function rebook(id){
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
        ctrl.details(id);
    });
}

//State Machine
function placed(id){
    facade.placed(id).then(function(data){
        ctrl.details(id);
    });
}

function done(id){
    facade.done(id).then(function(data){
        ctrl.details(id);
    });
}

module.exports = function getController() {
    return require('../scripts/Facade.js')().then(function(data){
        facade = data;
        return ctrl;
    });
};
