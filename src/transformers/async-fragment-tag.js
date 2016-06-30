'use strict';

exports.transform = function(el) {

    var dataProvider = el.getAttributeValue('data-provider');
    var varName = el.getAttributeValue('var');

    el.removeAttribute('data-provider');
    el.removeAttribute('var');

    el.argument = varName.value + ' from ' + dataProvider;
    el.setTagName('await');
};
