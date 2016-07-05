'use strict';

exports.transform = function(el) {
    let ifAttr = el.getAttribute('w-preserve-body-if');
    ifAttr.argument = ifAttr.value.toString();
    delete ifAttr.value;
};