var seq = new sequelize({
    host: 'localhost',
    dialect: 'sqlite',
    storage: '../db/jobs.db'
  });

  seq
  .authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });
