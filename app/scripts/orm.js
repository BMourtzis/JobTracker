//This file contains the connectionString and functions to test and operate the connection

var orm = {};

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
            addNewJob: function(jobname, timebooked, payment) {
                return orm.job.create({
                    jobName: jobname,
                    timeBooked: timebooked,
                    payment: payment,
                    state: 'Placed',
                    clientId: this.id,
                    gst: (payment/settings.GSTPercentage)
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
                if (this.enabled) {
                    var date = Date.today().set({
                        year: year,
                        month: month,
                        day: 1
                    }).first().sunday();
                    var returnObj = [];
                    month += 2;
                    switch (this.repetition) {
                        case "Daily":
                            returnObj.push(this.dailyGenerator(date, month));
                            break;
                        case "Weekly":
                            returnObj.push(this.weeklyGenerator(date, month));
                            break;
                        case "Fortnightly":
                            returnObj.push(this.fortnightlyGenerator(date, month));
                            break;
                        case "Monthly":
                            returnObj.push(this.monthlyGenerator(date, month))  ;
                            break;
                        default:
                    }
                    console.log(returnObj);
                    return Promise.all(returnObj);
                }
            },
            dailyGenerator: function dailyGenerator(date, nextMonth) {
                var repvalues = JSON.parse(this.repetitionValues);
                date.at({
                    hour: repvalues[i].hour,
                    minute: repvalues[i].minute
                });

                for (; date.toString("M") < (nextMonth); date.next().day()) {
                    return this.createJob(date);
                }
            },
            weeklyGenerator: function weeklyGenerator(date, nextMonth) {
                var repvalues = JSON.parse(this.repetitionValues);
                var promises = [];
                for (; date.toString("M") < (nextMonth); date.next().sunday()) {
                    for (var i = 0; i < repvalues.length; i++) {
                        var jobDate = new Date(date);
                        jobDate.add(repvalues[i].day).day().at({
                            hour: repvalues[i].hour,
                            minute: repvalues[i].minute
                        });

                        promises.push(this.createJob(jobDate));
                    }
                }
                return promises;
            },
            fortnightlyGenerator: function fortnightlyGenerator(date, nextMonth) {
                var repvalues = JSON.parse(this.repetitionValues);

                for (; date.toString("M") < (nextMonth); date.next().sunday().next().sunday()) {
                    for (var i = 0; i < repvalues.length; i++) {
                        var jobDate = new Date(date);
                        jobDate.add(repvalues[i].day).day().at({
                            hour: repvalues[i].hour,
                            minute: repvalues[i].minute
                        });

                        return this.createJob(jobDate);
                    }
                }
            },
            monthlyGenerator: function monthlyGenerator(date, nextMonth) {
                var repvalues = JSON.parse(this.repetitionValues);

                for (var i = 0; i < repvalues.length; i++) {
                    var jobDate = new Date(date);
                    jobDate.add(repvalues[i].day).day().at({
                        hour: repvalues[i].hour,
                        minute: repvalues[i].minute
                    });

                    return this.createJob(jobDate);
                }
            },
            createJob: function createJob(jobDate) {
                var payment = this.payment;
                var jobName = this.jobName;
                return orm.client.findById(this.clientId).then(function(client) {
                    return client.addNewJob(jobName, jobDate, payment);
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

//Association Definitions
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



//Utility Functions
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

function reinitializeTables() {
    return Promise.all([
        orm.job.sync(),
        orm.client.sync(),
        orm.jobScheme.sync(),
        orm.invoice.sync()
    ]);
}

function validateDB() {
    var exists = true;

    if (!fs.existsSync(settings.dbFile)) {
        exists = false;
        var sqlite = require("sqlite3");
        var db = new sqlite.Database(settings.dbFile, [sqlite3.OPEN_CREATE]);
        db.close();
    }

    connectionInitialization();

    if(!exists){
        return reinitializeTables().then(function(){
            return createAssociations().then(function() {
                return orm;
            });
        });
    }
    else {
        return createAssociations().then(function() {
            return orm;
        });
    }
}

module.exports = function getORM() {
    return Promise.resolve(validateDB());
};
