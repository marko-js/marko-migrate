"use strict";
var attributeParser = require("../../marko-2/attribute-parser");

exports.transform = function(el, context) {
  let varsAttr = el.getAttribute("vars");
  el.removeAttribute("vars");

  var vars = varsAttr.value.value;

  vars = attributeParser.parse(
    vars,
    { "*": { type: "expression" } },
    {
      ordered: true,
      errorHandler: function(message) {
        throw new Error(
          'Invalid variable declarations of "' + vars + '". Error: ' + message
        );
      }
    }
  );

  el.replaceAttributes(vars);
  el.setTagName("var");
};
