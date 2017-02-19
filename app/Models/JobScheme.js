//This file contains the definition of the jobScheme object/table.
//It includes the definition of functions and association with other tables.

function getJobScheme(){
    return this.connStr.define('jobScheme', {
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
        repeatition: {
            type: sequelize.ENUM('Daily', 'Weekly', 'Fortnightly', 'Monthly'),
            allowNull: false,
            field: 'repeatition'
        },
        repeatitionValues: {
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
        instanceMethods: { //TODO: Check if this is correct on all of them.
            generateJobs: function generateJobs(month){
                if (this.enabled) {
                    var date = Date.today().set({
                        month: month,
                        day: 1
                    }).first().sunday();

                    month += 2;
                    switch (this.repeatition) {
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
                var repvalues = JSON.parse(this.repeatitionValues);
                date.at({
                    hour: repvalues[i].hour,
                    minute: repvalues[i].minute
                });

                for (; date.toString("M") < (nextMonth); date.next().day()) {
                    this.creteJob(date);
                }
            },
            weeklyGenerator: function weeklyGenerator(date, nextMonth) {
                var repvalues = JSON.parse(this.repeatitionValues);

                for (; date.toString("M") < (nextMonth); date.next().sunday()) {
                    for (var i = 0; i < repvalues.length; i++) {
                        var jobDate = new Date(date);
                        jobDate.add(repvalues[i].day).day().at({
                            hour: repvalues[i].hour,
                            minute: repvalues[i].minute
                        });

                        this.creteJob(jobDate);
                    }
                }
            },
            fortnightlyGenerator: function fortnightlyGenerator(date, nextMonth) {
                var repvalues = JSON.parse(this.repeatitionValues);

                for (; date.toString("M") < (nextMonth); date.next().sunday().next().sunday()) {
                    for (var i = 0; i < repvalues.length; i++) {
                        var jobDate = new Date(date);
                        jobDate.add(repvalues[i].day).day().at({
                            hour: repvalues[i].hour,
                            minute: repvalues[i].minute
                        });

                        this.creteJob(jobDate);
                    }
                }
            },
            monthlyGenerator: function monthlyGenerator(date, nextMonth) {
                var repvalues = JSON.parse(this.repeatitionValues);

                for (var i = 0; i < repvalues.length; i++) {
                    var jobDate = new Date(date);
                    jobDate.add(repvalues[i].day).day().at({
                        hour: repvalues[i].hour,
                        minute: repvalues[i].minute
                    });

                    this.creteJob(jobDate);
                }
            },
            creteJob: function createJob(jobDate) {
                //TODO: create a job via the client
                this.job.create({
                    jobName: this.jobName,
                    timeBooked: jobDate,
                    payment: this.payment,
                    state: 'Placed',
                    clientID: this.clientID,
                    total: parseFloat(this.payment) + (0.1 * this.payment)
                });
            }
        }
    });
}












module.exports = getJobScheme;
