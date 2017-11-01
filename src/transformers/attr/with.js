"use strict";
var attributeParser = require("../../marko-2/attribute-parser");

exports.transform = function(el, attr, context) {
  let withAttr = el.getAttribute("with");
  el.removeAttribute("with");

  var vars = withAttr.value.value;

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

  var varsEl = context.template.builder.htmlElement("var", vars);
  el.wrapWith(varsEl);
};
