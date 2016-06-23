// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//Database scripts
window.sqlite3 = require('sqlite3').verbose();
window.sequelize = require('sequelize');
window.orm = require('./app/scripts/orm.js');
//Front-end Modules
window.$ = window.jQuery = require('jquery');
window.bootstrap = require('bootstrap');
//Scripts
window.UIFunctions = require('./app/scripts/script.js');
