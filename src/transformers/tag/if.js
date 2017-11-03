"use strict";

exports.transform = function(el) {
  let testAttr = el.getAttribute("test");
  el.removeAttribute("test");
  el.argument = testAttr.value.toString();
};
