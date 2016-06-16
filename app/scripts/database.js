'use strict'

window.connStr = new sequelize(null, null, null, {
    host: 'localhost',
    dialect: 'sqlite',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    storage: 'app/db/jobs.db'
});

// window.connStr
// .authenticate()
// .then(function(err) {
//   console.log('Connection has been established successfully.');
// })
// .catch(function (err) {
//   console.log('Unable to connect to the database:', err);
// });

var Client = connStr.define('client', {
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

// Client.sync({force: true})

var c = Client.create({
  firstName: 'Bill',
  lastName: 'Mourtzis',
  businessName: 'BM Software Pty Ltd',
  shortName: 'VCC',
  Address: '28 Jackson Cres, Pennant Hills, 2120',
  Email: 'mK@gmail.com',
  Phone: '2106127281',
}).then(function(client) {
  console.log(client.get({plain: true}));
});
