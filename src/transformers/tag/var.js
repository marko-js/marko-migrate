"use strict";

exports.transform = function(el, context) {
  let attributes = el.getAttributes();
  let scriptlets = [];

  attributes.forEach(attr => {
    let code = "var " + attr.name;
    if (attr.value) {
      code += "=" + attr.value;
    }

    scriptlets.push(context.template.builder.scriptlet(code));
  });

  el.replaceWith(scriptlets);
};
