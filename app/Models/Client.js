//This file contains the definition of the client object/table.
//It includes the definition of functions and association with other tables.

function getClient() {
    return this.connStr.define('client', {
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
                console.log(this);
                return job.create({
                    jobName: jobname,
                    timeBooked: timebooked,
                    payment: payment,
                    state: 'Placed',
                    clientID: this.id,
                    total: parseFloat(payment) + (0.1 * payment)
                });
            },
            addNewJobScheme: function addNewJobScheme(jobname, payment, repeatition, repetitionvalues){
                return jobScheme.create({
                    jobName: jobname,
                    enabled: true,
                    payment: payment,
                    repeatition: repeatition,
                    repeatitionValues: repeatitionvalues,
                    clientID: this.id
                });
            },
        }
    });
}

module.exports = getClient;
