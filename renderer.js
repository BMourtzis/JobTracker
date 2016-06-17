// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
window.$ = window.jQuery = require('jquery');
window.coreJS = require('core-js');
window.bootstrap = require('bootstrap');
window.sqlite3 = require('sqlite3').verbose();
window.sequelize = require('sequelize');
window.orm = require('./app/scripts/database.js');
orm.getClient(1).then(function(client){
  console.log(client.get('firstName'));
});
