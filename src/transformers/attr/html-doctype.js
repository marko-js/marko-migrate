"use strict";

exports.transform = function(el, attr, context) {
  el.removeAttribute("html-doctype");

  var doctype = attr.value.value;

  var builder = context.template.builder;

  var doctypeText = builder.text(
    builder.literal("<!DOCTYPE " + doctype + ">\n")
  );
  el.insertSiblingBefore(doctypeText);
};
