const FOUND_KEY_ATTRS_KEY = Symbol();

module.exports = function(el, attr, context) {
  let foundKeyAttrs =
    context.template[FOUND_KEY_ATTRS_KEY] ||
    (context.template[FOUND_KEY_ATTRS_KEY] = {});

  if (attr.name.endsWith(":key")) {
    let nameNoModifier = attr.name.slice(0, 0 - ":key".length);
    attr.name = nameNoModifier + ":scoped";
    if (attr.value.type === "Literal") {
      foundKeyAttrs[attr.value.value] = attr;
    }
  } else if (attr.name === "key") {
    if (attr.value.type === "Literal") {
      let keyValue = attr.value.value;

      if (foundKeyAttrs[keyValue]) {
        el.removeAttribute(attr.name);
        el.setAttributeValue("id:scoped", attr.value);
      }
    }
  }
};
