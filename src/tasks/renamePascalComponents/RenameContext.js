const RENAME_CONTEXT_KEY = Symbol();
const path = require("path");
const lowerCaseRegExp = /^[a-z-]+$/;

class RenameContext {
  constructor(migrateContext) {
    this.components = {};
    this.renamedComponents = {};
    this.migrateContext = migrateContext;
  }

  addTagDef(tagDef, options) {
    options = options || {};

    if (!tagDef || !tagDef.filePath) {
      return;
    }

    if (tagDef.html) {
      return;
    }

    let tagName = tagDef.name;
    if (!tagName) {
      return;
    }

    if (lowerCaseRegExp.test(tagName) === false) {
      return;
    }

    let filePath = tagDef.filePath;

    if (this.components.hasOwnProperty(filePath) === false) {
      let isInProject = this.migrateContext.isDirectoryInProject(
        path.dirname(tagDef.filePath)
      );

      if (options.inProjectOnly && !isInProject) {
        return;
      }

      let isComponentDirectory = false;

      if (path.basename(path.dirname(filePath)) === tagName) {
        // The component is self-contained in its own directory. For example:
        // - src/components/old-name/index.marko
        // - src/components/old-name/style.css
        //
        // We only need to rename the parent directory
        isComponentDirectory = true;
      } else {
        // The component resides alongside other components in the same directory.
        // For example:
        // - src/components/foo.marko
        // - src/components/foo.style.css
        // - src/components/bar.marko
        // - src/components/bar.style.css
        //
        // We only need to rename all of the component files
        let basename = path.basename(filePath);
        let ext = path.extname(filePath);
        let nameNoExt = basename.slice(0, 0 - ext.length);

        if (nameNoExt !== tagName) {
          return;
        }
      }

      this.components[tagDef.filePath] = {
        oldName: tagName,
        newName: null,
        isInProject: isInProject,
        isComponentDirectory
      };
    }
  }
}

RenameContext.getRenameContext = function(migrateContext) {
  let renameContext = migrateContext[RENAME_CONTEXT_KEY];
  if (!renameContext) {
    renameContext = migrateContext[RENAME_CONTEXT_KEY] = new RenameContext(
      migrateContext
    );
  }
  return renameContext;
};

module.exports = RenameContext;
