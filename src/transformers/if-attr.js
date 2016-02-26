'use strict';

exports.transform = function(el) {
    let ifAttr = el.getAttribute('if');
    ifAttr.argument = ifAttr.value.toString();
    delete ifAttr.value;
};