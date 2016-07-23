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

uiFunctions.Home = function() { require(uiFunctions.ContrDir+"Home.js").index(); }

uiFunctions.Jobs = function() {

}

uiFunctions.Clients = function() { require(uiFunctions.ContrDir+"Clients.js").index(); }
uiFunctions.getCreateClient = function() { require(uiFunctions.ContrDir+"Clients.js").getCreateClient(); }
uiFunctions.createClient = function() { require(uiFunctions.ContrDir+"Clients.js").createClient(); }
uiFunctions.clientDetails = function(id) { require(uiFunctions.ContrDir+"Clients.js").clientDetails(id); }

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

// jQuery(document).ready(function() {
    $(".clickable-row").click(function() {
        var ctrl = $(this).data("ctrl");
        var meth = $(this).data("method");
        var id = $(this).data("id");
        console.log(id);
        //require(uiFunctions.ContrDir+"Clients.js").createClient();
    });
// });
