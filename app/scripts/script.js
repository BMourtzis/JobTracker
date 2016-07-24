var uiFunctions = { }

uiFunctions.hidden = true;

uiFunctions.ContrDir = "../Controller/";

uiFunctions.toggleSidebar = function() {
    $("#sidebar").animate({
        // width: "100%"
    });
    $("#content").toggleClass("col-md-11 col-md-6");
}

uiFunctions.showSidebar = function() {

}

uiFunctions.hideSidebar = function() {

}

uiFunctions.home = function() { require(uiFunctions.ContrDir+"Home.js").index(); }

uiFunctions.jobs = function() { require(uiFunctions.ContrDir+"Jobs.js").index(); }
uiFunctions.getCreateJob = function() { require(uiFunctions.ContrDir+"Jobs.js").getCreateJob(); }
uiFunctions.createJob = function() { require(uiFunctions.ContrDir+"Jobs.js").createJob(); }
uiFunctions.jobDetails = function(id) { require(uiFunctions.ContrDir+"Jobs.js").clientJob(id); }
uiFunctions.getEditJob = function(id) { require(uiFunctions.ContrDir+"Jobs.js").getEditJob(id); }
uiFunctions.editJob = function(id) { require(uiFunctions.ContrDir+"Jobs.js").editJob(id); }

uiFunctions.clients = function() { require(uiFunctions.ContrDir+"Clients.js").index(); }
uiFunctions.getCreateClient = function() { require(uiFunctions.ContrDir+"Clients.js").getCreateClient(); }
uiFunctions.createClient = function() { require(uiFunctions.ContrDir+"Clients.js").createClient(); }
uiFunctions.clientDetails = function(id) { require(uiFunctions.ContrDir+"Clients.js").clientDetails(id); }
uiFunctions.getEditClient = function(id) { require(uiFunctions.ContrDir+"Clients.js").getEditClient(id); }
uiFunctions.editClient = function(id) { require(uiFunctions.ContrDir+"Clients.js").editClient(id); }

uiFunctions.Timetable = function() {

}

uiFunctions.Finances = function() {

}

uiFunctions.Settings = function() {

}

uiFunctions.emptySidebar = function() {

}

uiFunctions.changeContent = function() {

}

uiFunctions.changeSidebar = function() {

}

module.exports = uiFunctions;
