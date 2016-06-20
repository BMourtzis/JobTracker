// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//Database scripts
window.sqlite3 = require('sqlite3').verbose();
window.sequelize = require('sequelize');
window.orm = require('./app/scripts/orm.js');
//Front-end Scripts
window.$ = window.jQuery = require('jquery');
window.bootstrap = require('bootstrap');
//AngularJS
window.angular = require('angular');
//window.ui-bootstrap = require('angular-ui-bootstrap');
require('./app/app.js');
