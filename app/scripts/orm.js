//This file contains the connectionString and functions to test and operate the connection

var orm = {};

/**
 * connectionInitialization - Initiates the connection to the database
 */
function connectionInitialization() {
    orm.connStr = new sequelize(null, null, null, {
        host: 'localhost',
        dialect: 'sqlite',
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        },
        storage: settings.dbFile
    });
    initializeModels();
}

/**
 * initializeModels - Initiates the models of the database
 */
function initializeModels() {
    orm.client = orm.connStr.define('client', {
        id: {
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        firstName: {
            type: sequelize.STRING,
            field: 'firstname',
            allowNull: false
        },
        lastName: {
            type: sequelize.STRING,
            field: 'lastname',
            allowNull: false
        },
        businessName: {
            type: sequelize.STRING,
            field: 'businessname',
            allowNull: false
        },
        shortName: {
            type: sequelize.STRING(4),
            field: 'shortname',
            unique: true,
            allowNull: false
        },
        address: {
            type: sequelize.STRING(150),
            allowNull: false,
            field: 'address'
        },
        email: {
            type: sequelize.STRING(50),
            field: 'email',
            validate: {
                isEmail: true
            }
        },
        phone: {
            type: sequelize.INTEGER(10),
            field: 'phone'
        }
    }, {
        classMethods: {

        },
        instanceMethods: {
            addNewJob: function(jobname, timebooked, payment, schemeId) {
                return orm.job.create({
                    jobName: jobname,
                    timeBooked: timebooked,
                    payment: payment,
                    state: 'Placed',
                    schemeId: schemeId,
                    clientId: this.id,
                    gst: (payment / settings.GSTPercentage)
                });
            },
            addNewJobScheme: function addNewJobScheme(jobname, payment, repetition, repetitionvalues) {
                return orm.jobScheme.create({
                    jobName: jobname,
                    enabled: true,
                    payment: payment,
                    repetition: repetition,
                    repetitionValues: repetitionvalues,
                    clientId: this.id
                });
            },
            addNewInvoice: function addNewInvoice(year, month, total, invoiceNo) {
                return orm.invoice.create({
                    year: year,
                    month: month,
                    total: total,
                    paid: false,
                    invoiceNo: invoiceNo,
                    clientId: this.id
                }).then(function(data) {
                    return data.get({
                        plain: true
                    });
                });
            }
        }
    });

    //TODO: add notes and what needs to be done.

    orm.job = orm.connStr.define('job', {
        id: {
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        jobName: {
            type: sequelize.STRING(100),
            allowNull: false,
            field: 'jobName'
        },
        timeBooked: {
            type: sequelize.DATE,
            allowNull: false,
            field: 'timeBooked',
            get: function() {
                return moment(this.getDataValue('timeBooked'));
            }
        },
        payment: {
            type: sequelize.DECIMAL,
            allowNull: false,
            field: 'payment'
        },
        gst: {
            type: sequelize.DECIMAL,
            allowNull: false,
            field: 'gst'
        },
        schemeId: {
            type: sequelize.INTEGER,
            allowNull: true,
            field: 'schemeId'
        },
        clientId: {
            type: sequelize.INTEGER,
            field: "clientId"
        },
        invoiceId: {
            type: sequelize.INTEGER,
            field: "invoiceId"
        },
        state: {
            type: sequelize.ENUM('Placed', 'Done', 'Invoiced', 'Paid'),
            allowNull: false,
            field: 'state'
        }
    }, {
        classMethods: {

        },
        instanceMethods: {

        }
    });

    orm.jobScheme = orm.connStr.define('jobScheme', {
        id: {
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        jobName: {
            type: sequelize.STRING(100),
            allowNull: false,
            field: 'jobName'
        },
        enabled: {
            type: sequelize.BOOLEAN,
            allowNull: false,
            field: 'enabled'
        },
        payment: {
            type: sequelize.DECIMAL,
            allowNull: false,
            field: 'payment'
        },
        repetition: {
            type: sequelize.ENUM('Daily', 'Weekly', 'Fortnightly', 'Monthly'),
            allowNull: false,
            field: 'repetition'
        },
        repetitionValues: {
            type: sequelize.JSON,
            field: 'repetitionValues'
        },
        clientId: {
            type: sequelize.INTEGER,
            field: "clientId"
        },
    }, {
        classMethods: {

        },
        instanceMethods: {
            generateJobs: function generateJobs(year, month) {
                if (!this.enabled) {
                    return null;
                }

                var date = Date.today().set({
                    year: year,
                    month: month,
                    day: 1
                }).first().sunday();
                var returnObj;
                month += 2;

                if(month == 13) {
                    month = 1;
                }

                switch (this.repetition) {
                    case "Daily":
                        returnObj = this.dailyGenerator(date, month);
                        break;
                    case "Weekly":
                        returnObj = this.weeklyGenerator(date, month);
                        break;
                    case "Fortnightly":
                        returnObj = this.fortnightlyGenerator(date, month);
                        break;
                    case "Monthly":
                        returnObj = this.monthlyGenerator(date, month);
                        break;
                    default:
                }
                return Promise.all(returnObj);
            },
            dailyGenerator: function dailyGenerator(date, nextMonth) {
                var repvalues = JSON.parse(this.repetitionValues);
                var promises = [];

                while(date.toString("M") < (nextMonth)) {
                    for (var i = 0; i < repvalues.length; i++) {
                        date.at({
                            hour: repvalues[i].hour,
                            minute: repvalues[i].minute
                        });

                        var jobDate = new Date(date);
                        promises.push(this.createJob(jobDate));
                    }

                    date.next().day();
                }
                return promises;
            },
            weeklyGenerator: function weeklyGenerator(date, nextMonth) {
                var repvalues = JSON.parse(this.repetitionValues);
                var promises = [];

                while(date.toString("M") < (nextMonth)) {
                    for (var i = 0; i < repvalues.length; i++) {
                        var jobDate = new Date(date);
                        jobDate.add(repvalues[i].day).day().at({
                            hour: repvalues[i].hour,
                            minute: repvalues[i].minute
                        });

                        promises.push(this.createJob(jobDate));
                    }

                    date.next().sunday();
                }
                return promises;
            },
            fortnightlyGenerator: function fortnightlyGenerator(date, nextMonth) {
                // TODO: refactor fortnightlyGenerator
                var scheme = this;
                return [getLatestJobFromScheme(scheme.id, nextMonth, 14).then(function(data) {
                    if (data !== null) {
                        date = data;
                        date.next().sunday().next().sunday();
                    }

                    var repvalues = JSON.parse(scheme.repetitionValues);
                    var promises = [];

                    var month = date.getMonth();

                    while((month < nextMonth) || ((month == 11 || month == 12) && (nextMonth == 1 || nextMonth == 2))) {
                        for(var i = 0; i < repvalues.length; i++) {
                            var jobDate = new Date(date);
                            jobDate.add(repvalues[i].day).day().at({
                                hour: repvalues[i].hour,
                                minute: repvalues[i].minute
                            });

                            promises.push(scheme.createJob(jobDate));
                        }
                        date.next().sunday().next().sunday();
                        month = parseInt(date.toString("M"));
                    }

                    return Promise.all(promises);
                })];
            },
            monthlyGenerator: function monthlyGenerator(date, nextMonth) {
                // TODO: refactor monthlyGenerator
                var scheme = this;
                return [getLatestJobFromScheme(scheme.id, nextMonth, 28).then(function(data) {
                    if (data !== null) {
                        date = data;
                        date.next().sunday().next().sunday();
                        date.next().sunday().next().sunday();
                    }

                    var repvalues = JSON.parse(scheme.repetitionValues);
                    var promises = [];

                    var month = date.getMonth();

                    while((month < nextMonth) || ((month == 11 || month == 12) && (nextMonth == 1 || nextMonth == 2))) {
                        for (var i = 0; i < repvalues.length; i++) {
                            var jobDate = new Date(date);
                            jobDate.add(repvalues[i].day).day().at({
                                hour: repvalues[i].hour,
                                minute: repvalues[i].minute
                            });

                            promises.push(scheme.createJob(jobDate));
                        }
                        date.next().sunday().next().sunday();
                        date.next().sunday().next().sunday();
                        month = parseInt(date.toString("M"));
                    }

                    return Promise.all(promises);
                })];
            },
            createJob: function createJob(jobDate) {
                var payment = this.payment;
                var jobName = this.jobName;
                var schemeid = this.id;
                return orm.client.findById(this.clientId).then(function(client) {
                    return client.addNewJob(jobName, jobDate, payment, schemeid);
                });
            }
        }
    });

    orm.invoice = orm.connStr.define('invoice', {
        id: {
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        invoiceNo: {
            type: sequelize.STRING(8),
            allowNull: false,
            field: 'invoiceno'
        },
        year: {
            type: sequelize.INTEGER,
            allowNull: false,
            field: 'year'
        },
        month: {
            type: sequelize.INTEGER,
            allowNull: false,
            field: 'month'
        },
        paidAt: {
            type: sequelize.DATE,
            allowNull: true,
            field: 'paidAt',
            get: function() {
                return moment(this.getDataValue('paidAt'));
            }
        },
        total: {
            type: sequelize.DECIMAL,
            allowNull: false,
            field: 'total'
        },
        paid: {
            type: sequelize.BOOLEAN,
            allowNull: false,
            field: 'paid'
        },
        clientId: {
            type: sequelize.INTEGER,
            field: "clientId"
        },
        createdAt: {
            type: sequelize.DATE,
            allowNull: false,
            field: 'createdAt',
            get: function() {
                return moment(this.getDataValue('createdAt'));
            }
        }
    }, {
        indexes: [{
            unique: true,
            fields: ['year', 'month', 'clientId']
        }],
        classMethods: {

        },
        instanceMethods: {

        }
    });
}

/**
 * createAssociations - Initiates the associations of the models
 *
 * @return {Promise}  An empty promise
 */
function createAssociations() {
    return Promise.all([
        orm.client.hasMany(orm.job),
        orm.client.hasMany(orm.jobScheme),
        orm.client.hasMany(orm.invoice),
        orm.invoice.hasMany(orm.job),
        orm.jobScheme.belongsTo(orm.client, {
            foreignKey: "clientId"
        }),
        orm.job.belongsTo(orm.client, {
            foreignKey: "clientId"
        }),
        orm.job.belongsTo(orm.invoice, {
            foreignKey: "invoiceId"
        }),
        orm.invoice.belongsTo(orm.client, {
            foreignKey: "clientId"
        })
    ]);
}

/**
 * orm.testConnection - Tests the connection to the database
 */
orm.testConnection = function() {
    orm.connStr
        .authenticate()
        .then(function(err) {
            console.log('Connection has been established successfully.');
        })
        .catch(function(err) {
            console.log('Unable to connect to the database:', err);
        });
};

/**
 * reinitializeTables - Re initializes the tables of the database if they don't exist
 *
 * @return {Promise}  An empty promise
 */
function reinitializeTables() {
    return Promise.all([
        orm.job.sync(),
        orm.client.sync(),
        orm.jobScheme.sync(),
        orm.invoice.sync()
    ]);
}

/**
 * validateDB - Validates that the database file exists, if not it creates it
 *
 * @return {Object}  The orm
 */
function validateDB() {
    var exists = true;

    if (!fs.existsSync(settings.dbFile)) {
        exists = false;
        var sqlite = require("sqlite3");
        var db = new sqlite.Database(settings.dbFile, [sqlite3.OPEN_CREATE]);
        db.close();
    }

    connectionInitialization();

    if (!exists) {
        return reinitializeTables().then(function() {
            return createAssociations().then(function() {
                return orm;
            });
        });
    } else {
        return createAssociations().then(function() {
            return orm;
        });
    }
}

function getLatestJobFromScheme(schemeid, nextMonth, nod) {
    return orm.job.find({
        where: {
            schemeId: schemeid
        },
        order: [["timeBooked", "DESC"]],
        limit: 1
    }).then(function(data) {
        if(data == null) {
            return null;
        }
        // TODO: only load timeBooked
        var timeBooked = new Date(data.get({plain:true}).timeBooked);

        var month = timeBooked.getMonth() + 1;
        var day = timeBooked.getDate() + 1;
        var lastDayOfMonth = Date.today().moveToLastDayOfMonth().getDate() + 1;

        if(nextMonth - month == 2 && lastDayOfMonth - day < nod) {
            return timeBooked;
        }
        else if(nextMonth - month == 1 && day < nod) {
            return timeBooked;
        }
        else if((month == 11 || month == 12) && (nextMonth == 1 || nextMonth == 2)) {
            return timeBooked;
        }

        return null;
    });
}

/**
 * initiateORM - Initialises the ORM
 *
 * @return {Object}  The initiated ORM
 */
function initiateORM() {
    return Promise.resolve(validateDB());
}

module.exports = initiateORM();
