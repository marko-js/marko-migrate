'use strict';

exports.transform = function(el) {
    let attr = el.getAttribute('else-if');
    attr.argument = attr.value.toString();
    delete attr.value;
};