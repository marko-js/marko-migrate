'use strict';

exports.transform = function(el) {
    el.setTagName('marko-compiler-options');

    var whitespaceAttr = el.getAttribute('whitespace');
    if (whitespaceAttr) {
        el.removeAttribute('whitespace');

        if (whitespaceAttr.value.value === 'preserve') {
            el.setAttributeValue('preserve-whitespace', null);
        }
    }

    var commentsAttr = el.getAttribute('comments');
    if (commentsAttr) {
        el.removeAttribute('comments');

        if (commentsAttr.value.value === 'preserve') {
            el.setAttributeValue('preserve-comments', null);
        }
    }
};