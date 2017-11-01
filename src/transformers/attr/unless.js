'use strict';

exports.transform = function(el) {
    let attr = el.getAttribute('unless');
    attr.argument = attr.value.toString();
    delete attr.value;
};