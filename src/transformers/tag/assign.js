"use strict";

function addAssign(el) {
  let varAttr = el.getAttribute("var");
  let valueAttr = el.getAttribute("value");

  el.removeAttribute("var");
  el.removeAttribute("value");

  el.setAttributeValue(
    varAttr.value.value,
    (valueAttr && valueAttr.value) || "null"
  );
}

exports.transform = function(el) {
  addAssign(el);

  // el.forEachNextSibling((sibling) => {
  //     if (sibling.type === 'HtmlElement' && sibling.tagName === 'assign') {
  //         addAssign(sibling, el);
  //         sibling.detach();
  //     }
  // });
};
