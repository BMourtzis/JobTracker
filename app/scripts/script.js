var uiFunctions = { }

uiFunctions.hidden = true;

uiFunctions.ContrDir = "../Controller/";

uiFunctions.toggleSidebar = function() {
    $("#sidebar").animate({
        // width: "100%"
    });
    $("#content").toggleClass("col-md-11 col-md-6");
}

uiFunctions.home = function() {
    require(uiFunctions.ContrDir+"Home.js").index();
    uiFunctions.changeActive(0);
}

uiFunctions.jobs = function() {
    require(uiFunctions.ContrDir+"Jobs.js").index();
    uiFunctions.changeActive(1);
}
uiFunctions.getCreateJob = function() { require(uiFunctions.ContrDir+"Jobs.js").getCreateJob(); }
uiFunctions.getCreateJob = function(id) { require(uiFunctions.ContrDir+"Jobs.js").getCreateJob(id); }
uiFunctions.createJob = function() { require(uiFunctions.ContrDir+"Jobs.js").createJob(); }
uiFunctions.removeJob = function(id) { require(uiFunctions.ContrDir+"Jobs.js").removeJob(id); }
uiFunctions.jobDetails = function(id) { require(uiFunctions.ContrDir+"Jobs.js").jobDetails(id); }
uiFunctions.getEditJob = function(id) { require(uiFunctions.ContrDir+"Jobs.js").getEditJob(id); }
uiFunctions.editJob = function(id) { require(uiFunctions.ContrDir+"Jobs.js").editJob(id); }

uiFunctions.clients = function() {
    require(uiFunctions.ContrDir+"Clients.js").index();
    uiFunctions.changeActive(2);
}
uiFunctions.getCreateClient = function() { require(uiFunctions.ContrDir+"Clients.js").getCreateClient(); }
uiFunctions.createClient = function() { require(uiFunctions.ContrDir+"Clients.js").createClient(); }
uiFunctions.clientDetails = function(id) { require(uiFunctions.ContrDir+"Clients.js").clientDetails(id); }
uiFunctions.getEditClient = function(id) { require(uiFunctions.ContrDir+"Clients.js").getEditClient(id); }
uiFunctions.editClient = function(id) { require(uiFunctions.ContrDir+"Clients.js").editClient(id); }

uiFunctions.getCreateJobScheme = function(id) { require(uiFunctions.ContrDir+"JobSchemes.js").getCreateJobScheme(id); }
uiFunctions.createJobScheme = function() { require(uiFunctions.ContrDir+"JobSchemes.js").createJobScheme(); }
uiFunctions.addRepValues = function() { require(uiFunctions.ContrDir+"JobSchemes.js").addRepValues(); }
uiFunctions.removeRepValues = function(data) {
    $(data).parent().remove();
    require(uiFunctions.ContrDir+"JobSchemes.js").removeRepValues();
}


uiFunctions.Timetable = function() {
    uiFunctions.changeActive(3);
}

uiFunctions.Finances = function() {
    uiFunctions.changeActive(4);
}

uiFunctions.Settings = function() {
    uiFunctions.changeActive(5);
}

uiFunctions.changeActive = function(itemNo) {
    var listItems = $("#navbar-list").children();
    listItems.each(function(no, data) {
        $(data).removeClass("active");
    });
    $(listItems[itemNo]).addClass("active");
}

module.exports = uiFunctions;
