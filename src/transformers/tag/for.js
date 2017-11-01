"use strict";
var fixPropertyLooping = require("../../marko-2/fixPropertyLooping");

exports.transform = function(el) {
  var eachValue = el.getAttributeValue("each");
  if (!eachValue) {
    return;
  }

  let final = fixPropertyLooping(eachValue.value);

  var separator = el.getAttributeValue("separator");
  var iterator = el.getAttributeValue("iterator");
  var statusVar = el.getAttributeValue("status-var");

  if (separator || iterator || statusVar) {
    final += " |";
    if (separator) {
      final += " separator=" + separator;
    }
    if (iterator) {
      final += " iterator=" + iterator;
    }
    if (statusVar) {
      final += " status-var=" + statusVar.value;
    }
  }

  el.removeAttribute("each");
  el.removeAttribute("separator");
  el.removeAttribute("iterator");
  el.removeAttribute("status-var");
  el.removeAttribute("for-loop");

  el.argument = final;
};
