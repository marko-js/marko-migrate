class TransformerContext {
  constructor(compileContext, migrateContext) {
    this.macroNames = {};
    this.requires = [];
    this.options = migrateContext.options;
    this.builder = compileContext.builder;
    this.compileContext = compileContext;
  }

  getTagDef(tagName) {
    return this.compileContext.getTagDef(tagName);
  }

  registerMacroName(name) {
    this.macroNames[name] = true;
  }

  isMacro(name) {
    return this.macroNames.hasOwnProperty(name);
  }

  addRequire(moduleName, varName) {
    this.requires.push({
      moduleName: moduleName,
      varName: varName
    });
  }
}

module.exports = TransformerContext;
