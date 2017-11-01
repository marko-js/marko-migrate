'use strict';

exports.transform = function(el, attr) {
    el.removeAttribute('c-space');

    if (attr.value.value === 'preserve') {
        el.setAttributeValue('marko-preserve-whitespace');
    }
};