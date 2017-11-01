require("prompt").start();

const promptGet = require("util").promisify(require("prompt").get);
const lowerCaseRegExp = /^[a-z-]+$/;
const RenameContext = require("./RenameContext");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const shell = require("shelljs");

function getDefaultName(tagName) {
  if (tagName.startsWith("app-")) {
    tagName = tagName.substring("app-".length);
  }

  return tagName.replace(/(?:^|[-])([a-z])/g, function(match, lower) {
    return lower.toUpperCase();
  });
}

async function gitRenameFile(oldFile, newFile) {
  return new Promise((resolve, reject) => {
    const process = spawn("git", ["mv", oldFile, newFile]);

    process.stdout.on("data", data => {
      console.log(`stdout: ${data}`);
    });

    process.stderr.on("data", data => {
      // console.log(`stderr: ${data}`);
    });

    process.on("close", code => {
      resolve();
      // console.log(`child process exited with code ${code}`);
    });
  });
}

async function renameFile(oldFile, newFile) {
  try {
    shell.mkdir("-p", path.dirname(newFile));
  } catch (e) {
    // Ignore
  }

  await gitRenameFile(oldFile, newFile);

  try {
    fs.renameSync(oldFile, newFile);
  } catch (e) {
    // Ignore
  }
}

async function renameComponentFiles(context) {
  let renameContext = RenameContext.getRenameContext(context);
  if (!renameContext) {
    return;
  }

  for (let templatePath of Object.keys(renameContext.nameMappings)) {
    let newName = renameContext.nameMappings[templatePath].newName;
    let oldName = renameContext.nameMappings[templatePath].oldName;

    if (!newName) {
      continue;
    }

    let basename = path.basename(templatePath);
    let newTemplatePath;
    let isComponentDir;

    if (basename === "index.marko") {
      isComponentDir = true;
      // We need to rename the parent directory
      let componentDir = path.dirname(templatePath);
      let componentsDir = path.dirname(componentDir);

      newTemplatePath = path.join(componentsDir, newName, "index.marko");
    } else {
      isComponentDir = false;
      // We need to rename the basename
      newTemplatePath = path.join(
        path.dirname(templatePath),
        newName + ".marko"
      );
    }

    await renameFile(templatePath, newTemplatePath);

    // One more rename to fix the case on the file system
    if (isComponentDir) {
      let newComponentDir = path.dirname(newTemplatePath);
      let componentsDir = path.dirname(newComponentDir);

      let tempComponentDir = path.join(componentsDir, `~${newName}`);
      fs.renameSync(newComponentDir, tempComponentDir);
      fs.renameSync(tempComponentDir, newComponentDir);

      if (newName.toLowerCase() !== oldName.toLowerCase()) {
        shell.rm("-rf", path.dirname(templatePath));
      }
    } else {
      let componentsDir = path.dirname(newTemplatePath);
      let tempComponentFile = path.join(componentsDir, `~${newName}.marko`);
      fs.renameSync(newTemplatePath, tempComponentFile);
      fs.renameSync(tempComponentFile, newTemplatePath);
    }
  }
}

async function getNewComponentNames(context) {
  let renameContext = RenameContext.getRenameContext(context);
  if (!renameContext) {
    return;
  }

  let namesToTransform = Object.keys(renameContext.nameMappings);
  if (!namesToTransform.length) {
    return;
  }

  namesToTransform.sort();

  let options = context.options;

  for (let templatePath of namesToTransform) {
    if (renameContext.nameMappings[templatePath].newName) {
      continue;
    }

    let newName;
    let oldName = renameContext.nameMappings[templatePath].oldName;

    if (options.autoPascalCase) {
      newName = getDefaultName(oldName);
    } else {
      console.log(`Enter a PascalCase name for <${oldName}>:`);
      let input = await promptGet({
        properties: {
          name: {
            pattern: /^[A-Z][a-zA-Z0-9]+$/,
            message: "Name must be only letters or numbers in PascalCase",
            required: true,
            default: getDefaultName(oldName)
          }
        }
      });

      newName = input.name;
    }

    renameContext.nameMappings[templatePath].newName = newName;
  }
}

module.exports = function(context) {
  context.registerTagTransform("ANY", {
    pretransform(el, context) {
      let tagName = el.tagName;
      if (!tagName) {
        return;
      }

      if (lowerCaseRegExp.test(tagName) === false) {
        return;
      }

      let tagDef = context.template.getTagDef(tagName);
      if (!tagDef || !tagDef.template) {
        return;
      }

      let renameContext = RenameContext.getRenameContext(context);

      if (
        renameContext.nameMappings.hasOwnProperty(tagDef.template) === false
      ) {
        renameContext.nameMappings[tagDef.template] = {
          oldName: tagName,
          newName: null
        };
      }
    },

    transform(el, context) {
      let tagName = el.tagName;
      if (!tagName) {
        return;
      }

      let tagDef = context.template.getTagDef(tagName);
      if (!tagDef || !tagDef.template) {
        return;
      }

      let renameContext = RenameContext.getRenameContext(context);

      let target = renameContext.nameMappings[tagDef.template];
      if (!target) {
        return;
      }

      el.tagName = target.newName;
    }
  });
  context.events.on("afterPretransformTemplate", event => {
    event.await(getNewComponentNames(event.context));
  });
  context.events.on("afterMigrateProject", event => {
    event.await(renameComponentFiles(context));
  });
};
