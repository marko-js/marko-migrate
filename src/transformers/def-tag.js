'use strict';
exports.transform = function(el, context) {
    el.setTagName('macro');
    var functionAttrValue = el.getAttributeValue('function');
    el.removeAttribute('function');

    var functionString = functionAttrValue.value.trim();
    var argIndex = functionString.indexOf('(');
    var macroName;
    var macroArgs;

    // We need to separate out the arguments from the name
    if (argIndex === -1) {
        macroName = functionString;
        macroArgs = '';
    } else {
        macroName = functionString.substring(0, argIndex);
        macroArgs = functionString.substring(argIndex+1, functionString.length - 1);
    }

    context.registerMacroName(macroName);

    el.removeAllAttributes();

    el.addAttribute({
        name: macroName,
        argument: macroArgs
    });
};