require("prompt").start();

const promptGet = require("util").promisify(require("prompt").get);
const RenameContext = require("./RenameContext");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const shell = require("shelljs");
const markoCompiler = require("marko/compiler");

function getDefaultName(tagName) {
  if (tagName.startsWith("app-")) {
    tagName = tagName.substring("app-".length);
  }

  return tagName.replace(/(?:^|[-])([a-z])/g, function(match, lower) {
    return lower.toUpperCase();
  });
}

async function discoverComponents(dir, context) {
  let taglibLookup = markoCompiler.buildTaglibLookup(dir);
  let tagDefs = taglibLookup.getTagsSorted();

  for (let tagDef of tagDefs) {
    let renameContext = RenameContext.getRenameContext(context);
    renameContext.addTagDef(tagDef, { inProjectOnly: true });
  }
}

async function gitRenameFile(oldFile, newFile) {
  return new Promise((resolve, reject) => {
    const process = spawn("git", ["mv", "-f", oldFile, newFile]);

    // process.stdout.on("data", data => {
    //   // console.log(`stdout: ${data}`);
    // });
    //
    // process.stderr.on("data", data => {
    //   // console.log(`stderr: ${data}`);
    // });

    process.on("close", code => {
      resolve();
      // console.log(`child process exited with code ${code}`);
    });
  });
}

async function renameFile(oldFile, newFile) {
  try {
    shell.rm("-rf", newFile);
  } catch (e) {
    // Ignore
  }

  try {
    shell.mkdir("-p", path.dirname(newFile));
  } catch (e) {
    // Ignore
  }

  await gitRenameFile(oldFile, newFile);

  try {
    fs.renameSync(oldFile, newFile);
  } catch (e) {
    // Ignore. It may have already been moved with the git rename
  }

  // One more rename to ensure that the file name is put in with the correct case
  // let dir = path.dirname(newFile);
  // let basename = path.basename(newFile);
  // let tempFile = path.join(dir, "~" + basename);
  //
  // fs.renameSync(newFile, tempFile);
  // fs.renameSync(tempFile, newFile);
}

async function renameComponentFiles(context) {
  let renameContext = RenameContext.getRenameContext(context);
  if (!renameContext) {
    return;
  }

  for (let filePath of Object.keys(renameContext.components)) {
    let component = renameContext.components[filePath];
    if (!component.isInProject) {
      context.logger.warn(
        `Component outside current project should be migrated to PascalCase: ${filePath}`
      );
      continue;
    }

    let newName = component.newName;
    let oldName = component.oldName;

    let isComponentDirectory = component.isComponentDirectory;

    if (!newName || newName.toLowerCase() === "skip") {
      continue;
    }

    let renames = {};

    if (isComponentDirectory) {
      // The component is self-contained in its own directory. For example:
      // - src/components/old-name/index.marko
      // - src/components/old-name/style.css
      //
      // We only need to rename the parent directory
      let componentDir = path.dirname(filePath);
      let componentsDir = path.dirname(componentDir);

      renames[componentDir] = path.join(componentsDir, newName);
    } else {
      // The component resides alongside other components in the same directory.
      // For example:
      // - src/components/foo.marko
      // - src/components/foo.style.css
      // - src/components/bar.marko
      // - src/components/bar.style.css
      //
      // We need to rename all of the related the component files in the directory
      let basename = path.basename(filePath);
      let ext = path.extname(filePath);
      let nameNoExt = basename.slice(0, 0 - ext.length);
      let prefix = nameNoExt + ".";
      let dir = path.dirname(filePath);
      let dirFiles = fs.readdirSync(dir);
      dirFiles.forEach(dirFile => {
        if (dirFile.startsWith(prefix)) {
          let newFilePath = path.join(
            dir,
            newName + dirFile.substring(oldName.length)
          );
          renames[path.join(dir, dirFile)] = newFilePath;
        }
      });
    }

    let oldFilePaths = Object.keys(renames);
    for (let i = 0; i < oldFilePaths.length; i++) {
      let oldFilePath = oldFilePaths[i];
      let newFilePath = renames[oldFilePath];
      await renameFile(oldFilePath, newFilePath);
    }
  }
}

async function getNewComponentNames(context) {
  let renameContext = RenameContext.getRenameContext(context);
  if (!renameContext) {
    return;
  }

  let componentFilePaths = Object.keys(renameContext.components);
  if (!componentFilePaths.length) {
    return;
  }

  let options = context.options;

  for (let filePath of componentFilePaths) {
    let component = renameContext.components[filePath];
    if (component.newName) {
      continue;
    }

    let newName;
    let oldName = component.oldName;
    let defaultName = getDefaultName(oldName);

    if (options.autoPascalCase) {
      newName = defaultName;
    } else {
      if (component.isInProject) {
        console.log(`Enter a PascalCase name for <${oldName}> or type "skip":`);
        try {
          let input = await promptGet({
            properties: {
              name: {
                pattern: /^[A-Z][a-zA-Z0-9]+|skip$/,
                message:
                  'Name must be only letters or numbers in PascalCase or "skip"',
                required: true,
                default: defaultName
              }
            }
          });
          newName = input.name;
        } catch (e) {
          process.exit(1);
        }
      } else {
        console.log(
          `The <${oldName}> component is from an installed dependency\n` +
            `and it has not been migrated to PascalCase. While we can't\n` +
            `rename the component since it is outside the current project,\n` +
            `we can switch to using <${defaultName}>.\n\n` +
            `Switch to <${defaultName}>?`
        );

        let input;

        try {
          input = await promptGet({
            properties: {
              rename: {
                pattern: /^n|y|no|yes$/i,
                message: "Y or N expected",
                required: true,
                default: "Y"
              }
            }
          });
        } catch (e) {
          process.exit(1);
        }
        if (input && input.rename) {
          switch (input.rename.toLowerCase()) {
            case "y":
            case "yes":
              newName = defaultName;
              break;
          }
        }
      }
    }

    if (newName) {
      newName = newName.trim();
    }
    component.newName = newName;
  }
}

module.exports = function(context) {
  context.registerTagTransform("ANY", {
    pretransform(el, context) {
      let tagName = el.tagName;
      if (!tagName) {
        return;
      }

      let tagDef = context.template.getTagDef(tagName);
      let renameContext = RenameContext.getRenameContext(context);
      renameContext.addTagDef(tagDef);
    },

    transform(el, context) {
      let tagName = el.tagName;
      if (!tagName) {
        return;
      }

      let tagDef = context.template.getTagDef(tagName);
      if (!tagDef || !tagDef.filePath) {
        return;
      }

      let renameContext = RenameContext.getRenameContext(context);

      let target = renameContext.components[tagDef.filePath];
      if (!target || !target.newName) {
        return;
      }

      el.tagName = target.newName;
    }
  });
  context.events.on("afterPretransformTemplate", event => {
    event.await(getNewComponentNames(event.context));
  });

  context.events.on("beforeMigrateDirectory", event => {
    event.await(discoverComponents(event.dir, context));
  });

  context.events.on("beforeMigrateProject", event => {
    event.await(renameComponentFiles(context));
  });

  context.events.on("afterMigrateProject", event => {
    event.await(renameComponentFiles(context));
  });
};
