var orm = { }

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
              total: payment+(0.1*payment)
          });
      },
      addNewJobScheme: function(jobname, payment, time, day, repeatition, repeatitionvalues) {
        //   orm.createJobScheme(jobname, payment, time, day, repeatition, repeatitionvalues, this.id);
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
        return moment(this.getDataValue('timeBooked'))
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
    type: sequelize.ENUM('Daily', 'Weekly+', 'Weekly', 'Fortnightly', 'Monthly'),
    allowNull: false,
    field: 'repeatition'
  },
  repeatitionValues: {
    type: sequelize.JSON,
    field: 'repeatitionValues'
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
}

orm.reinitializeTables = function() {
  // orm.Client.sync({force: true});
  // orm.Job.sync({force: true});
  // orm.JobScheme.sync({force: true});
}

//Client Functions
////Get all Clients
orm.getAllClients = function () {
    return orm.Client.findAll();
}

////Search Functions
//////Simple Search
orm.getClient = function(id) {
    return orm.Client.findById(id);
}

orm.getClientFull = function(id) {
  return orm.Client.findById(id,{include: [orm.Job, orm.JobScheme]});
}

//////Advanced Search
orm.findClients = function(searchParams) {
  return orm.Client.findAll({
    where: searchParams
  });
}

////Create Functions
orm.createClient = function(firstname, lastname, businessname, shortname, address, email, phone) {
  orm.Client.create({
    firstName: firstname,
    lastName: lastname,
    businessName: businessname,
    shortName: shortname,
    Address: address,
    Email: email,
    Phone: phone,
  });
}

////Edit Function
orm.editClient = function(id, data) {
    orm.getClient(id).then(function(client) {
        for (var i = 0; i < data.length; i++) {
            if(data[i].value != "")
            {
                client[data[i].name] = data[i].value;
            }
        }
        client.save().then(function() {
            UIFunctions.clients()
            UIFunctions.clientDetails(id);
        });
    });
}


//Job Functions
////Get all Clients
orm.getAllJobs = function () {
    return orm.Job.findAll({include: [ orm.Client ] });
}

////Search Functions
//////Simple Search
orm.getJob = function(id) {
    return orm.Job.findById(id);
}

orm.getJobFull = function(id) {
  return orm.Job.findById(id,{include: [orm.Client]});
}

//////Advanced Search
orm.FindJobs = function(searchParams) {
  return orm.Job.findAll({
    where: searchParams
  });
}

////Create Functions
orm.createJob = async function(jobname, timebooked, payment, clientid) {
    return await orm.getClient(clientid).then(function(client) {
         return client.addNewJob(jobname, timebooked, payment);
    });
}

////Remove Functions
orm.removeJob = function(id) {
    orm.getJob(id).then(function(job) {
        job.destroy().then(function() {
            UIFunctions.jobs();
        });
    });
}

//JobScheme Functions
////Search Functions
//////Simple Search
orm.getJobScheme = function(id) {
  return orm.JobScheme.findById(id);
}

//////Advanced Search
orm.findJobSchemes = function(searchParams) {
  return orm.JobScheme.findAll({
    where: searchParams
  });
}

////Create Functions
orm.createJobScheme = function(jobname, payment, repeatition, repeatitionvalues, clientid) {
  orm.JobScheme.create({
    jobName: jobname,
    enabled: true,
    payment: payment,
    repeatition: repeatition,
    repeatitionValues: repeatitionvalues,
    clientID: clientid
  });
}

module.exports = orm;
