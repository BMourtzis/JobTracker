// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

window.app = require('electron').remote.app;

//Back-end Modules
window.datejs = require('datejs');
Date.i18n.setLanguage(["en-AU"]); //Change the locale to en-AU
window.fs = require('fs');
window.path = require('path');

//Database Modules
window.sqlite3 = require('sqlite3').verbose();
window.sequelize = require('sequelize');
window.moment = require('moment');

//Front-end Modules
window.$ = window.jQuery = require('jquery');
require('bootstrap-notify');
window.jsrender = require('jsrender');
require('./app/scripts/JSRenderExtensions.js');
window.bootstrap = require('bootstrap');
window.datetimepicker = require('eonasdan-bootstrap-datetimepicker-npm'); // window.$.fn.datetimepicker = $.fn.datetimepicker; Need this!
window.templateHelper = require("./app/scripts/TemplateHelper.js");
window.numberFormatter = require("./app/scripts/numberFormatter.js");

//Managers
window.contentManager = new require("./app/scripts/Manager.js")("content", false);
window.sidebarManager = new require("./app/scripts/Manager.js")("sidebar", true);

window.validRules = require("./app/scripts/ValidationRulesHelper.js");
require('./app/scripts/script.js');

//Scripts
window.settings = require("./app/scripts/Settings.js");
require("./app/Controller/Controllers.js")().then(function(data) {
    window.ctrls = data;
    ctrls.Home.index();
});

//Debug
require("devtron").install();
