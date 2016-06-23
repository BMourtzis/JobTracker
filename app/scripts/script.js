var uiFunctions = { }

uiFunctions.toggleSidebar = function() {
    $("#content").toggleClass("col-md-11 col-md-6");
    $("#sidebar").toggle();
}


module.exports = uiFunctions;
