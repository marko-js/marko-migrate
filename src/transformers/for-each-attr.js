'use strict';

exports.transform = function(el, attr, context) {
    el.setAttributeValue('for', attr.value);
    el.removeAttribute('for-each');

    require('./for-attr').transform(el, attr, context);
};