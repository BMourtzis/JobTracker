//This file contains the definition of the job object/table.
//It includes the definition of functions and association with other tables.

function getJob(){
    return this.connStr.define('job', {
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
}

module.exports = getJob;
