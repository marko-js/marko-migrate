'use strict';

exports.transform = function(el, context) {
    var moduleAttr = el.getAttributeValue('module');
    var varAttr = el.getAttributeValue('var');

    var moduleName = moduleAttr.value;
    var varName = varAttr.value;
    context.addRequire(moduleName, varName);
    return null;
};