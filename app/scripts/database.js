var orm = { }

orm.connStr = new sequelize(null, null, null, {
    host: 'localhost',
    dialect: 'sqlite',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    storage: 'app/db/jobs.db'
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
      model: this.Client,
      key: 'id'
    }
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
      model: this.Client,
      key: 'id'
    }
  }
},{

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
  //Client.sync({force: true});
  //Job.sync({force: true});
  //JobScheme.sync({force: true});
}

//Client Functions
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
orm.createClient = function(fistname, lastname, businessname, shortname, address, email, phone) {
  orm.Client.create({
    firstName: firstname,
    lastName: lastnane,
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
orm.createJob = function(fistname, lastname, businessname, shortname, address, email, phone) {
  // orm.Job.create({
  //   firstName: firstname,
  //   lastName: lastnane,
  //   businessName: businessname,
  //   shortName: shortname,
  //   Address: address,
  //   Email: email,
  //   Phone: phone,
  // });
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
orm.createJobScheme = function(fistname, lastname, businessname, shortname, address, email, phone) {
  // orm.JobScheme.create({
  //   firstName: firstname,
  //   lastName: lastnane,
  //   businessName: businessname,
  //   shortName: shortname,
  //   Address: address,
  //   Email: email,
  //   Phone: phone,
  // });
}

module.exports = orm;
