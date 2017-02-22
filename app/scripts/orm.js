//This file contains the connectionString and functions to test and operate the connection

var orm = {};

orm.connStr = new sequelize(null, null, null, {
    host: 'localhost',
    dialect: 'sqlite',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    storage: './app/db/jobs.db'
});



orm.client =  orm.connStr.define('client', {
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
        type: sequelize.STRING(3),
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
        addNewJob: function(jobname, timebooked, payment){
            return orm.job.create({
                jobName: jobname,
                timeBooked: timebooked,
                payment: payment,
                state: 'Placed',
                clientId: this.id,
                gst: (0.1 * payment)
            });
        },
        addNewJobScheme: function addNewJobScheme(jobname, payment, repetition, repetitionvalues){
            return orm.jobScheme.create({
                jobName: jobname,
                enabled: true,
                payment: payment,
                repetition: repetition,
                repetitionValues: repetitionvalues,
                clientId: this.id
            });
        },
        addNewInvoice: function addNewInvoice(year, month, total){
            return orm.invoice.create({
                year: year,
                month: month,
                total: total,
                paid: false,
                clientId: this.id
            }).then(function(data){
                return data.get({plain: true});
            }, function(data){console.log(data);});
        }
    }
});

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
    }
}, {
    classMethods: {

    },
    instanceMethods: {
        generateJobs: function generateJobs(month){
            if (this.enabled) {
                var date = Date.today().set({
                    month: month,
                    day: 1
                }).first().sunday();

                month += 2;
                switch (this.repetition) {
                    case "Daily":
                        this.dailyGenerator(date, month);
                        break;
                    case "Weekly":
                        this.weeklyGenerator(date, month);
                        break;
                    case "Fortnightly":
                        this.fortnightlyGenerator(date, month);
                        break;
                    case "Monthly":
                        this.monthlyGenerator(date, month);
                        break;
                    default:
                }
            }
        },
        dailyGenerator: function dailyGenerator(date, nextMonth) {
            var repvalues = JSON.parse(this.repetitionValues);
            date.at({
                hour: repvalues[i].hour,
                minute: repvalues[i].minute
            });

            for (; date.toString("M") < (nextMonth); date.next().day()) {
                this.createJob(date);
            }
        },
        weeklyGenerator: function weeklyGenerator(date, nextMonth) {
            var repvalues = JSON.parse(this.repetitionValues);

            for (; date.toString("M") < (nextMonth); date.next().sunday()) {
                for (var i = 0; i < repvalues.length; i++) {
                    var jobDate = new Date(date);
                    jobDate.add(repvalues[i].day).day().at({
                        hour: repvalues[i].hour,
                        minute: repvalues[i].minute
                    });

                    this.createJob(jobDate);
                }
            }
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

                    this.createJob(jobDate);
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

                this.createJob(jobDate);
            }
        },
        createJob: function createJob(jobDate) {
            var payment = this.payment;
            var jobName = this.jobName;
            orm.client.findById(this.clientId).then(function(client){
                client.addNewJob(jobName, jobDate, payment);
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
            return moment(this.getDataValue('timeBooked'));
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
    }
}, {
    indexes:[{
        unique:true,
        fields:['year', 'month', 'clientId']
    }],
    classMethods: {

    },
    instanceMethods: {

    }
});

//Association Definitions
orm.jobScheme.belongsTo(orm.client);
orm.job.belongsTo(orm.client);
orm.job.belongsTo(orm.invoice);
orm.invoice.belongsTo(orm.client, {foreignKey: "clientId"});
orm.client.hasMany(orm.job);
orm.client.hasMany(orm.jobScheme);
orm.client.hasMany(orm.invoice);
orm.invoice.hasMany(orm.job);

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

orm.reinitializeTables = function() {
    orm.invoice.sync({force: true});
    orm.client.sync({force: true});
    orm.job.sync({force: true});
    orm.jobScheme.sync({force: true});
};

module.exports = orm;
