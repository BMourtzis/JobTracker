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

uiFunctions.Home = function() {
    require(uiFunctions.ContrDir+"Home.js");
}

uiFunctions.Jobs = function() {

}

uiFunctions.Clients = function() {

}

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
