'use strict';

exports.transform = function(el, attr, context) {
    if (attr.value.value === 'false') {
        el.setAttributeValue('marko-body', context.builder.literal('static-text'));
    }
    el.removeAttribute(attr.name);
};