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
                clientID: this.id,
                total: parseFloat(payment) + (0.1 * payment)
            });
        },
        addNewJobScheme: function addNewJobScheme(jobname, payment, repetition, repetitionvalues){
            return orm.jobScheme.create({
                jobName: jobname,
                enabled: true,
                payment: payment,
                repetition: repetition,
                repetitionValues: repetitionvalues,
                clientID: this.id
            });
        },
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
    total: {
        type: sequelize.DECIMAL,
        allowNull: false,
        field: 'total'
    },
    state: {
        type: sequelize.ENUM('Placed', 'Done', 'Invoiced', 'Paid'),
        allowNull: false,
        field: 'state'
    },
    clientID: {
        type: sequelize.INTEGER,
        references: {
            model: this.client,
            key: 'id'
        }
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
        field: 'repeatition'
    },
    repetitionValues: {
        type: sequelize.JSON,
        field: 'repeatitionValues'
    },
    clientID: {
        type: sequelize.INTEGER,
        field: "ClientID",
        references: {
            model: this.client,
            key: 'id'
        }
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
            orm.client.findById(this.clientID).then(function(client){
                client.addNewJob(jobName, jobDate, payment);
            });
        }
    }
});

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

orm.jobScheme.belongsTo(orm.client);
orm.job.belongsTo(orm.client);
orm.client.hasMany(orm.job);
orm.client.hasMany(orm.jobScheme);

orm.reinitializeTables = function() {
    // orm.Client.sync({force: true});
    // orm.Job.sync({force: true});
    // orm.JobScheme.sync({force: true});
};

module.exports = orm;
