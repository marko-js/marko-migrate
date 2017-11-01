'use strict';

exports.transform = function(el) {
    let ifAttr = el.getAttribute('if');
    if (ifAttr.value != null) {
        ifAttr.argument = ifAttr.value.toString();
        delete ifAttr.value;
    }
};