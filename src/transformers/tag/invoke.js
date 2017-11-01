"use strict";

/*
If macro:

Old:
<invoke function="greeting" name="John" count="${10}"/>
<invoke function="greeting('Frank', 20)"/>

New:
<greeting name="John" count=10/>
<greeting('Frank', 20)

---------


If not a macro:

Old:
<invoke function="console.log('Hello', data.name)"/>

New:
<invoke console.log('Hello', data.name)/>
 */
exports.transform = function(el, context) {
  var functionAttrValue = el.getAttributeValue("function");
  el.removeAttribute("function");

  var functionString = functionAttrValue.value.trim();
  var argIndex = functionString.indexOf("(");
  var functionName;
  var functionArgs;

  // We need to separate out the arguments from the name
  if (argIndex === -1) {
    functionName = functionString;
    functionArgs = null;
  } else {
    functionName = functionString.substring(0, argIndex);
    functionArgs = functionString.substring(
      argIndex + 1,
      functionString.length - 1
    );
  }

  if (context.template.isMacro(functionName)) {
    el.setTagName(functionName);
    if (functionArgs) {
      el.argument = functionArgs;
    }
  } else {
    el.removeAllAttributes();
    el.addAttribute({
      name: functionName,
      argument: functionArgs
    });
  }

  context.template.registerMacroName(functionName);
};
