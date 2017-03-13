function initiate() {
    var numberFormatter = require("numeral");
    numberFormatter.defaultFormat('$0,0.00');
    return numberFormatter;
}

module.exports = initiate();
