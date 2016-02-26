'use strict';
var attributeParser = require('../util/attribute-parser');

exports.transform = function(el, attr, context) {

    let withAttr = el.getAttribute('with');
    el.removeAttribute('with');

    var vars = withAttr.value.value;

    vars = attributeParser.parse(vars, { '*': { type: 'expression' } }, {
        ordered: true,
        errorHandler: function (message) {
            throw new Error('Invalid variable declarations of "' + vars + '". Error: ' + message);
        }
    });

    var varsEl = context.builder.htmlElement('var', vars);
    el.wrapWith(varsEl);
};