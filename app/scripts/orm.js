var orm = { };

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

//ObjectModels
orm.Client = orm.connStr.define('client', {
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
      addNewJob: function(jobname, timebooked, payment) {
          return orm.Job.create({
              jobName: jobname,
              timeBooked: timebooked,
              payment: payment,
              state: 'Placed',
              clientID: this.id,
              total: parseFloat(payment)+(0.1*payment)
          });
      },
      addNewJobScheme: function(jobname, payment, repeatition, repeatitionvalues) {
          return orm.JobScheme.create({
            jobName: jobname,
            enabled: true,
            payment: payment,
            repeatition: repeatition,
            repeatitionValues: repeatitionvalues,
            clientID: this.id
          });
      }
  }
});

orm.Job = orm.connStr.define('job', {
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
    type: sequelize.ENUM('Placed', 'Done', 'Paid'),
    allowNull: false,
    field: 'state'
  },
  clientID: {
    type: sequelize.INTEGER,
    references: {
      model: orm.Client,
      key: 'id'
    }
  }
},{
  classMethods:{

  },
  instanceMethods: {

  }
});

orm.JobScheme = orm.connStr.define('jobScheme', {
  id : {
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
      model: orm.Client,
      key: 'id'
    }
  }
},{
  classMethods:{

  },
    instanceMethods: {
        generateJobs: function(month) {
            var date = Date.today().set({month: month, day: 1}).first().sunday();

            switch (this.repeatition) {
                case "Daily":
                    this.dailyGenerator(date, month+2);
                    break;
                case "Weekly":
                    this.weeklyGenerator(date, month+2);
                    break;
                case "Fortnightly":
                    this.fortnightlyGenerator(date, month+2);
                    break;
                case "Monthly":
                    this.monthlyGenerator(date, month+2);
                    break;
                default:
            }

        }, dailyGenerator: function(date, nextMonth){
            var repvalues = JSON.parse(this.repeatitionValues);
            date.at({hour: parseInt(repvalues[i].hour), minute: parseInt(repvalues[i].minute)});

            for(; date.toString("M") < (nextMonth); date.next().day())
            {
                this.creteJob(date);
            }
        }, weeklyGenerator: function(date, nextMonth){
            var repvalues = JSON.parse(this.repeatitionValues);

            for(; date.toString("M") < (nextMonth); date.next().sunday())
            {
                for(var i = 0; i< repvalues.length; i++)
                {
                    var jobDate = new Date(date);
                    jobDate.add(parseInt(repvalues[i].day)).day().at({hour: parseInt(repvalues[i].hour), minute: parseInt(repvalues[i].minute)});

                    this.creteJob(jobDate);
                }
            }
        }, fortnightlyGenerator: function(date, nextMonth){
            var repvalues = JSON.parse(this.repeatitionValues);

            for(; date.toString("M") < (nextMonth); date.next().sunday().next().sunday())
            {
                for(var i = 0; i< repvalues.length; i++)
                {
                    var jobDate = new Date(date);
                    jobDate.add(parseInt(repvalues[i].day)).day().at({hour: parseInt(repvalues[i].hour), minute: parseInt(repvalues[i].minute)});

                    this.creteJob(jobDate);
                }
            }
        }, monthlyGenerator: function(date, nextMonth){
            var repvalues = JSON.parse(this.repeatitionValues);

            for(var i = 0; i< repvalues.length; i++)
            {
                var jobDate = new Date(date);
                jobDate.add(parseInt(repvalues[i].day)).day().at({hour: parseInt(repvalues[i].hour), minute: parseInt(repvalues[i].minute)});

                this.creteJob(jobDate);
            }
        }, creteJob: function(jobDate){
            orm.Job.create({
                jobName: this.jobName,
                timeBooked: jobDate,
                payment: this.payment,
                state: 'Placed',
                clientID: this.clientID,
                total: parseFloat(this.payment)+(0.1*this.payment)
            });
        }
  }
});

orm.Job.belongsTo(orm.Client);
orm.JobScheme.belongsTo(orm.Client);
orm.Client.hasMany(orm.Job);
orm.Client.hasMany(orm.JobScheme);

//Utility Functions
orm.testConnection = function() {
  orm.connStr
  .authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });
};

orm.reinitializeTables = function() {
  // orm.Client.sync({force: true});
  // orm.Job.sync({force: true});
  // orm.JobScheme.sync({force: true});
};

module.exports = orm;
