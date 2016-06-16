var seq = new sequelize(null, null, null, {
    host: 'localhost',
    dialect: 'sqlite',
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    },
    storage: 'app/db/jobs.db'
  });

  seq
  .authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });

  var Client = seq.define('client', {
    id: {
      type: sequelize.INTEGER,
      primaryKey: true,
      field: 'id'
    },
    firstname: {
      type: sequelize.STRING,
      field: 'firstname'
    },
    lastname: {
      type: sequelize.STRING,
      field: 'lastname'
    },
    businessName: {
      type:  sequelize.STRING,
      field: 'businessName'
    }
  });

  Client.findOne().then(function (client) {
    console.log(client);
});
