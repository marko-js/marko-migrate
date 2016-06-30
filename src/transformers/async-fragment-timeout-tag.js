'use strict';

exports.transform = function(el) {
    el.setTagName('await-timeout');
};
