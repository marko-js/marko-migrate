'use strict';

exports.transform = function(el, attr) {
    el.removeAttribute(attr.name);
};