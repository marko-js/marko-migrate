const RENAME_CONTEXT_KEY = Symbol();

class RenameContext {
  constructor() {
    this.nameMappings = {};
    this.renamedComponents = {};
  }
}

RenameContext.getRenameContext = function(context) {
  let renameContext = context[RENAME_CONTEXT_KEY];
  if (!renameContext) {
    renameContext = context[RENAME_CONTEXT_KEY] = new RenameContext();
  }
  return renameContext;
};

module.exports = RenameContext;
