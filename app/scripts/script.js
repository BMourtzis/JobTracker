function initiate() {
    $("#home-nav-item").click(function() {
        home();
    });
    $("#jobs-nav-item").click(function() {
        jobs();
    });
    $("#schemes-nav-item").click(function() {
        services();
    });
    $("#clients-nav-item").click(function() {
        clients();
    });
    $("#invoices-nav-item").click(function() {
        invoices();
    });
    $("#timetable-nav-item").click(function() {
        timetable();
    });
    $("#finances-nav-item").click(function() {
        finances();
    });
    $("#settings-nav-item").click(function() {
        settings();
    });
    $("#goBack-button").click(function() {
        goBack();
    });
}

function home() {
    removeActive();
    $("#home-nav-item").parent().addClass("active");
    ctrls.Home.index();
}

function jobs() {
    removeActive();
    $("#jobs-nav-item").parent().addClass("active");
    ctrls.Jobs.index();
}

function services() {
    removeActive();
    $("#schemes-nav-item").parent().addClass("active");
    ctrls.JobSchemes.index();
}

function clients() {
    removeActive();
    $("#clients-nav-item").parent().addClass("active");
    ctrls.Clients.index();
}

function invoices() {
    removeActive();
    $("#invoices-nav-item").parent().addClass("active");
    ctrls.Invoices.index();
}

function timetable() {
    removeActive();
    $("#timetable-nav-item").parent().addClass("active");
    ctrls.Timetable.index();
}

function finances() {
    removeActive();
    $("#finances-nav-item").parent().addClass("active");
    ctrls.Misc.comingsoon();
}

function settings() {
    removeActive();
    $("#settings-nav-item").parent().addClass("active");
    ctrls.Settings.index();
}

function goBack() {
    sidebarManager.goBack();
}

function removeActive() {
    $("#navbar-list li").removeClass("active");
}

module.exports = initiate();
