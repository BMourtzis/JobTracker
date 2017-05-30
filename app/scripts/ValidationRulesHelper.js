var validationRules = {};

validationRules.Selected = function(select) {
    if (select.serializeArray().length === 0) {
        validationRules.hasError(select.parent());
    } else {
        validationRules.isSuccess(select.parent());
    }
};

validationRules.isEmptyField = function(field) {
    if (field.val() === "") {
        validationRules.hasError(field.parent());
        return true;
    } else {
        validationRules.isSuccess(field.parent());
        return false;
    }
};

validationRules.isNumeric = function(field) {
    if (!validationRules.isEmptyField(field) && !$.isNumeric(field.val())) {
        validationRules.hasError(field.parent());
    }
};

validationRules.isEmail = function(field) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (!validationRules.isEmptyField(field) && !regex.test(field.val())) {
        validationRules.hasError(field.parent());
    }
};

validationRules.hasError = function(parent) {
    parent.addClass("has-error");
    $("#form-submit-button").attr("disabled", true);
};

validationRules.isSuccess = function(parent) {
    parent.removeClass("has-error");
    parent.addClass("has-success");
    $("#form-submit-button").attr("disabled", false);
};

module.exports = validationRules;
