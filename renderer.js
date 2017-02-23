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
window.moment = require('moment');

//Front-end Modules
window.$ = window.jQuery = require('jquery');
window.jsrender = require('jsrender');
window.bootstrap = require('bootstrap');
window.datetimepicker = require('eonasdan-bootstrap-datetimepicker-npm'); // window.$.fn.datetimepicker = $.fn.datetimepicker; Need this!

//Scripts
window.UIFunctions = require('./app/scripts/script.js');
require('./app/scripts/JSRenderExtensions.js');
// window.RG = require('./app/scripts/invoiceGenerator.js');

window.orm = require("./app/scripts/orm.js");

window.register = require('./app/Registers/InvoiceRegister.js');


UIFunctions.home();
