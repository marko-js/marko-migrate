module.exports = function(context) {
  context.events.on("afterTransformTemplate", ({ context, root }) => {
    let builder = context.template.builder;
    let requires = context.template.requires;
    if (requires.length) {
      for (let i = requires.length - 1; i >= 0; i--) {
        let req = requires[i];
        let importLine =
          "import " + req.varName + " from " + JSON.stringify(req.moduleName);
        let importEl = builder.htmlElement("import");
        importEl.tagString = importLine;
        root.prependChild(importEl);
      }
    }
  });
};
