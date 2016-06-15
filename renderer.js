// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
$ = window.jQuery = require('jquery');
window.coreJS = require('core-js');
window.bootstrap = require('bootstrap');
window.sqlite3 = require('sqlite3');
window.sequelize = require('sequelize');
var database = require('./app/scripts/database.js');
