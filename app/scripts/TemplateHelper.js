var helper = {};

helper.getRelativePath = function(dirname, todir) {
    var templatePath = path.relative("./", path.resolve(dirname, todir));
    templatePath = templatePath.replaceAll("\\", "/");
    return "./" + templatePath;
};

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    search = escapeRegExp(search);
    return target.replace(new RegExp(search, 'g'), replacement);
};

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

module.exports = helper;
