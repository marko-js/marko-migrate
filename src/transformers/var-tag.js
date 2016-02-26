'use strict';

function addVar(fromEl, toEl) {
    let nameAttr = fromEl.getAttribute('name');
    let valueAttr = fromEl.getAttribute('value');

    fromEl.removeAttribute('name');
    fromEl.removeAttribute('value');

    toEl.setAttributeValue(nameAttr.value.value, valueAttr && valueAttr.value);
}

exports.transform = function(el) {
    addVar(el, el);

    // el.forEachNextSibling((sibling) => {
    //     if (sibling.type === 'HtmlElement' && sibling.tagName === 'var') {
    //         addVar(sibling, el);
    //         sibling.detach();
    //     }
    // });
};