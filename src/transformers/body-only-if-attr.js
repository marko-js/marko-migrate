'use strict';

exports.transform = function(el, attr) {
    attr.argument = attr.value.toString();
    delete attr.value;
};