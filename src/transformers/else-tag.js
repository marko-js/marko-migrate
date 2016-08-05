'use strict';

exports.transform = function(el) {
    let testAttr = el.getAttribute('test');
    if (testAttr) {
        el.removeAttribute('test');
        el.addAttribute({
            name: 'if',
            argument: testAttr.value.toString()
        });
    }
};