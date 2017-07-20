var orm;

var register = {};

/**
 * register.getAllClients - Gets all clients from the database
 *
 * @return {Promise}  A promise with a list of clients
 */
register.getAllClients = function() {
    return orm.client.findAll({
        order: "businessName ASC"
    }).then(function(query) {
        var data = [];
        for (var i = 0; i < query.length; i++) {
            data.push(query[i].get({
                plain: true
            }));
        }
        return data;
    });
};

/**
 * register.getClient - Gets the client specified
 *
 * @param  {Number} id The id of the client
 * @return {Promise}    A promise with a client
 */
register.getClient = function(id) {
    return orm.client.findById(id).then(function(query) {
        return query.get({
            plain: true
        });
    });
};

/**
 * register.getClientFull - Gets the client specficied including jobs and jobschemes
 *
 * @param  {Number} id The id of the client
 * @return {Promise}   A promise with the client
 */
register.getClientFull = function(id) {
    return orm.client.findById(id, {
        inlcude: [orm.job, orm.jobScheme]
    }).then(function(query) {
        return query.get({
            plain: true
        });
    });
};

/**
 * register.createClient - Creates a new client
 *
 * @param  {String} firstname    The first name of the client
 * @param  {String} lastname     The last name of the client
 * @param  {String} businessname The business name of the client
 * @param  {String} shortname    The short name of the client, used for invoicing
 * @param  {String} address      The address of the client
 * @param  {String} email        The email of the client
 * @param  {Number} phone        The phone of the client
 * @return {Promise}             A promise with the new client
 */
register.createClient = function(firstname, lastname, businessname, shortname, address, email, phone) {
    return orm.client.create({
        firstName: firstname,
        lastName: lastname,
        businessName: businessname,
        shortName: shortname,
        address: address,
        email: email,
        phone: phone,
    });
};

/**
 * register.editClient - Edits the client with new data
 *
 * @param  {Number} id   The id of the client
 * @param  {Object} data An object that includes the changes data for the client
 * @return {Promise}     A promise with the edited client
 */
register.editClient = function(id, data) {
    return orm.client.findById(id).then(function(query) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].value !== "") {
                query[data[i].name] = data[i].value;
            }
        }

        return query.save();
    });
};

/**
 * register.removeClient - Removes a client
 *
 * @param  {Number} id The id of the client
 * @return {Promise}   A promise with the removed client
 */
register.removeClient = function(id) {
    return orm.client.findById(id).then(function(client) {
        return client.destroy();
    });
};

/**
 * initiateRegister - Returns the initiated Client Register
 *
 * @return {Promise}  A promise with the Client Register
 */
function initiateRegister(injORM) {
    orm = injORM;
    return register;
}

module.exports = initiateRegister;
