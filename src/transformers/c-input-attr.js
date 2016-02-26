'use strict';

exports.transform = function(el) {
    let attr = el.getAttribute('c-input');
    el.removeAttribute('c-input');
    el.argument = attr.value.toString();
};