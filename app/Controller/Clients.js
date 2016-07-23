var ctrl = { }

ctrl.ctrlName = "Clients";
ctrl.templateDir = "./app/Templates/";

ctrl.index = function() {

    orm.getAllClients().then(function(query) {
        var temp = jsrender.templates(ctrl.templateDir+ctrl.ctrlName+'/index.html');
        var data = {
            clients: new Array()
        };
        for (var i = 0; i < query.length; i++) {
            data.clients.push(query[i].get({plain:true }));
        }
        console.log(data);
        var html = temp(data);
        $("#content").html(html);
    });
    ctrl["clientDetails"](1);
}

ctrl.clientDetails = function(id) {
    orm.getClient(id).then(function(data) {
        var temp = jsrender.templates(ctrl.templateDir+ctrl.ctrlName+'/details.html');
        var clients = data.get({plain:true });
        var html = temp(clients);
        $("#sidebar").html(html);
    });
}

ctrl.getCreateClient = function() {
    var temp = jsrender.templates(ctrl.templateDir+ctrl.ctrlName+'/create.html');
    $("#sidebar").html(temp);
}

ctrl.createClient = function() {
    var formData = $("#createClientForm").serializeArray();
    orm.createClient(formData[2].value, formData[3].value, formData[0].value, formData[1].value, formData[4].value, formData[5].value, formData[6].value)

}

module.exports = ctrl;
