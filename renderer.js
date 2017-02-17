// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//Back-end Modules
window.datejs = require('datejs');
window.fs = require('fs');
window.path = require('path');

//Database Modules
window.sqlite3 = require('sqlite3').verbose();
window.sequelize = require('sequelize');
window.facade = require('./app/scripts/Facade.js');
window.moment = require('moment');
window.ctrl = require("./app/Controller/Controllers.js");

//Front-end Modules
window.$ = window.jQuery = require('jquery');
window.jsrender = require('jsrender');
window.bootstrap = require('bootstrap');
window.datetimepicker = require('eonasdan-bootstrap-datetimepicker-npm'); // window.$.fn.datetimepicker = $.fn.datetimepicker; Need this!

//Scripts
window.UIFunctions = require('./app/scripts/script.js');
require('./app/scripts/JSRenderExtensions.js');
window.RG = require('./app/scripts/invoiceGenerator.js');

facade.generateClientInvoice(3, 2017, 1);

// orm.testConnection();

UIFunctions.home();
