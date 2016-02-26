'use strict';

function addAssign(fromEl, toEl) {
    let varAttr = fromEl.getAttribute('var');
    let valueAttr = fromEl.getAttribute('value');

    fromEl.removeAttribute('var');
    fromEl.removeAttribute('value');

    toEl.setAttributeValue(varAttr.value.value, valueAttr && valueAttr.value);
}

exports.transform = function(el) {
    addAssign(el, el);

    // el.forEachNextSibling((sibling) => {
    //     if (sibling.type === 'HtmlElement' && sibling.tagName === 'assign') {
    //         addAssign(sibling, el);
    //         sibling.detach();
    //     }
    // });
};