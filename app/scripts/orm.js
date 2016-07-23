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
  Address: {
    type: sequelize.STRING(150),
    allowNull: false,
    field: 'address'
  },
  Email: {
    type: sequelize.STRING(50),
    field: 'email',
    validate: {
        isEmail: true
    }
  },
  Phone: {
    type: sequelize.INTEGER(10),
    field: 'phone'
  }
}, {
  classMethods: {

  },
  instanceMethods: {
    createJob: function(jodname, timebooked, payment) {
      orm.createJob(jodname, timebooked, payment, this.id);
    },
    createJobScheme: function(jobname, payment, time, day, repeatition, repeatitionvalues) {
        orm.createJobScheme(jobname, payment, time, day, repeatition, repeatitionvalues, this.id);
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
  JobName: {
    type: sequelize.STRING(100),
    allowNull: false,
    field: 'jobName'
  },
  TimeBooked: {
    type: sequelize.DATE,
    allowNull: false,
    field: 'timeBooked'
  },
  Payment: {
    type: sequelize.DECIMAL,
    allowNull: false,
    field: 'payment'
  },
  State: {
    type: sequelize.ENUM('Placed', 'Done', 'Paid'),
    allowNull: false,
    field: 'state'
  },
  ClientID: {
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

orm.JobScheme = orm.connStr.define('jonScheme', {
  id : {
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  JobName: {
    type: sequelize.STRING(100),
    allowNull: false,
    field: 'jobName'
  },
  Enabled: {
    type: sequelize.BOOLEAN,
    allowNull: false,
    field: 'enabled'
  },
  Payment: {
    type: sequelize.DECIMAL,
    allowNull: false,
    field: 'payment'
  },
  Time: {
    type: sequelize.DATE,
    allowNull: false,
    filed: 'time'
  },
  Day: {
    type: sequelize.INTEGER(1),
    allowNull: false,
    field: 'day'
  },
  Repeatition: {
    type: sequelize.ENUM('Daily', 'Weekly+', 'Weekly', 'Bi-Monthly', 'Monthly'),
    allowNull: false,
    field: 'repeatition'
  },
  RepeatitionValues: {
    type: sequelize.JSON,
    field: 'repeatitionValues'
  },
  ClientID: {
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
//Get all Clients
orm.getAllClients = function () {
    return orm.Client.all();
}

////Search Functions
//////Simple Search
orm.getClient = function(id) {
  return orm.Client.findById(id);
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


//Job Functions
////Search Functions
//////Simple Search
orm.getJob = function(id) {
  return orm.Job.findById(id);
}

//////Advanced Search
orm.FindJobs = function(searchParams) {
  return orm.Job.findAll({
    where: searchParams
  });
}

////Create Functions
orm.createJob = function(jodname, timebooked, payment, clientid) {
  orm.Job.create({
    JobName: jobname,
    TimeBooked: timebooked,
    Payment: payment,
    Status: 'Placed',
    ClientID: clientid
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
orm.createJobScheme = function(jobname, payment, time, day, repeatition, repeatitionvalues, clientid) {
  orm.JobScheme.create({
    JobName: jobname,
    Enabled: true,
    Payment: payment,
    Time: time,
    Day: day,
    Repeatition: repeatition,
    RepeatitionValues: repeatitionvalues,
    ClientID: clientid
  });
}

module.exports = orm;
