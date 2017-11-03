module.exports = function(el, attr, context) {
  if (!attr.name.startsWith("w-on")) {
    return;
  }

  let name = attr.name;
  attr.name = name.substring("w-".length);
  attr.argument = attr.value.toString();
  attr.value = null;
};
