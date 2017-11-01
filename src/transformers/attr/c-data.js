'use strict';

exports.transform = function(el) {
    let attr = el.getAttribute('c-data');
    el.removeAttribute('c-data');
    el.argument = attr.value.toString();
};