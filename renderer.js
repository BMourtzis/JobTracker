// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

window.app = require('electron').remote.app;

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
require('./app/scripts/JSRenderExtensions.js');
window.bootstrap = require('bootstrap');
window.datetimepicker = require('eonasdan-bootstrap-datetimepicker-npm'); // window.$.fn.datetimepicker = $.fn.datetimepicker; Need this!
window.templateHelper = require("./app/scripts/TemplateHelper.js");

//Managers
window.contentManager = new require("./app/scripts/Manager.js")("content", false);
window.sidebarManager = new require("./app/scripts/Manager.js")("sidebar", true);

//Scripts
require('./app/Registers/SettingsRegister.js')();
require('./app/scripts/script.js')().then(function(data) {
    window.UIFunctions = data;
    UIFunctions.home();
});
