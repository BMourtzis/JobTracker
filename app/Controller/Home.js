var facade;

var ctrl = { };

// NOTE: Do they need to be properties?
ctrl.ctrlName = "Home";
ctrl.templateDir = "../Templates/";
ctrl.selectedDate = Date.today();

/**
 * ctrl.index - Renders the index page for Home
 *
 * @return {Promise}  an empty promise
 */
ctrl.index = function() {
    contentManager.restartLineup(ctrl.ctrlName, "index", ctrl.index.bind(this));
    var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/index.html");

    var temp = jsrender.templates(templatePath);
    var html = temp();
    $("#content").html(html);

    ctrl.selectedDate = Date.today();
    return loadDayJobs();
};

/**
 * loadDayJobs - Loads day jobs for the selectedDate of the object
 *
 * @return {Promise}  an empty promise
 */
function loadDayJobs() {
    return facade.getDayJobs(ctrl.selectedDate).then(function(data){
        data.selectedDay = ctrl.selectedDate.toString("dd/MM/yyyy");
        data.next = new Date(ctrl.selectedDate).add(1).day().toString("dd/MM/yyyy");
        data.previous = new Date(ctrl.selectedDate).add(-1).day().toString("dd/MM/yyyy");

        data.sum = 0;

        for(var i = 0; i < data.jobs.length; i++){
            data.sum += data.jobs[i].payment + data.jobs[i].gst;
        }

        var templatePath = templateHelper.getRelativePath(__dirname, ctrl.templateDir + ctrl.ctrlName + "/table.html");

        var tableTemp = jsrender.templates(templatePath);
        var table = tableTemp(data);
        $("#homeDailyTable").html(table);

        $("#prev-day-button").click(function(){previousDay();});
        $("#reload-day-button").click(function(){loadDayJobs();});
        $("#next-day-button").click(function(){nextDay();});
        $(".placed").click(function(){done($(this).data("id"));});
        $(".done").click(function(){placed($(this).data("id"));});
        $("#home-job-table button").click(function(){ctrls.Jobs.details($(this).data("id"));});
    });
}

/**
 * nextDay - Goes to the next day
 *
 * @return {Promise}  an empty promise
 */
function nextDay(){
    ctrl.selectedDate.add(1).day();
    contentManager.add(ctrl.ctrlName, "loadDayJobs", loadDayJobs.bind(this));
    return loadDayJobs();
}

/**
 * previousDay - Goes to the previous day
 *
 * @return {Promise}  an empty promise
 */

function previousDay(){
    ctrl.selectedDate.add(-1).day();
    contentManager.add(ctrl.ctrlName, "loadDayJobs", loadDayJobs.bind(this));
    return loadDayJobs();
}

/**
 * placed - Changes the status of a job to placed
 *
 * @param  {number} clientId the id of the client
 * @return {Promise}
 */

function placed(clientId){
    return facade.placed(clientId).then(function(){
        return loadDayJobs();
    });
}

/**
 * done - Changes the status of a job to done
 *
 * @param  {number} clientId the id of the client
 * @return {Promise}
 */

function done(clientId){
    return facade.done(clientId).then(function(data){
        return loadDayJobs();
    });
}


/**
 * getController - Initiates the controller
 *
 * @return {Object}  Client controller
 */
 function initaitesController() {
     return require('../scripts/Facade.js').then(function(data){
         facade = data;
         return ctrl;
     });
 }

module.exports = initaitesController();
