'use strict';

exports.transform = function(el) {
    let templateAttr = el.getAttribute('template');
    el.removeAttribute('template');

    el.argument = templateAttr.value.toString();
};