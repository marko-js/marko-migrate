var forEachPropRegEx = /^\((\s*(?:[A-Za-z_][A-Za-z0-9_]*)\s*,\s*(?:[A-Za-z_][A-Za-z0-9_]*)\s*)\)(\s+in\s+(?:.+))$/;

module.exports = function fixPropertyLooping(str) {
    return str.replace(forEachPropRegEx, function(match, nameVarInner, remaining) {
        return nameVarInner + remaining;
    });
};