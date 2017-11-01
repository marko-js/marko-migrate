"use strict";
var attributeParser = require("../../marko-2/attribute-parser");
var fixPropertyLooping = require("../../marko-2/fixPropertyLooping");

exports.transform = function(el) {
  if (el.tagName === "label") {
    return;
  }

  let forAttr = el.getAttribute("for");
  let value = forAttr.value;
  let stringValue = value.value;

  let forEachProps = attributeParser.parse(
    stringValue,
    {
      each: { type: "custom" },
      separator: { type: "expression" },
      iterator: { type: "expression" },
      "status-var": { type: "identifier" },
      "for-loop": {
        type: "boolean",
        allowExpressions: false
      }
    },
    {
      removeDashes: true,
      defaultName: "each",
      errorHandler: function(message) {
        throw new Error(
          'Invalid for attribute of "' + forAttr.name + '". Error: ' + message
        );
      }
    }
  );

  let final = fixPropertyLooping(forEachProps.each);

  if (
    forEachProps.separator ||
    forEachProps.iterator ||
    forEachProps.statusVar
  ) {
    final += " |";
    if (forEachProps.separator) {
      final += " separator=" + forEachProps.separator;
    }
    if (forEachProps.iterator) {
      final += " iterator=" + forEachProps.iterator;
    }
    if (forEachProps.statusVar) {
      final += " status-var=" + forEachProps.statusVar;
    }
  }

  delete forAttr.value;
  forAttr.argument = final;
};
