"use strict";

const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const transformTemplate = require("./transformTemplate");
const logging = require("./logging");
const MigrateContext = require("./MigrateContext");
const { getRootDir } = require("lasso-package-root");

function relativePath(filename) {
  let relativePath = path.relative(process.cwd(), filename);
  return relativePath || ".";
}

function isExcluded(name) {
  if (name === "node_modules") {
    return true;
  }
  if (name.startsWith(".")) {
    return true;
  }
}

async function loadTasks(context) {
  let tasksDir = path.join(__dirname, "tasks");
  let taskFiles = fs.readdirSync(tasksDir);
  taskFiles.forEach(taskFile => {
    if (taskFile.endsWith(".js")) {
      taskFile = path.join(tasksDir, taskFile);
    } else {
      taskFile = path.join(tasksDir, taskFile, "index.js");
      try {
        taskFile = require.resolve(taskFile);
      } catch (e) {
        return;
      }
    }

    let taskFunc = require(taskFile);
    taskFunc(context);
  });
}

async function migrateTemplate(filePath, context) {
  try {
    let transformedSrc = await transformTemplate(filePath, context);
    context.queueWriteTemplateFile(filePath, transformedSrc);
    return transformedSrc;
  } catch (e) {
    context.logger.error(
      `Unable to migrate template at path "${relativePath(
        filePath
      )}". Error: ${e.stack || e}`
    );
  }
}

async function migrateDirTree(rootDir, context) {
  var queue = [];

  function enqueue(dir) {
    queue.unshift(dir);
  }

  function dequeue() {
    if (queue.length) {
      return queue.shift();
    } else {
      return undefined;
    }
  }

  async function migrateDir(dir) {
    console.log(`Migrating directory: ${relativePath(dir)}`);

    await context.events.emitAsync("beforeMigrateDirectory", {
      dir
    });

    var filenames = fs.readdirSync(dir);
    for (let i = 0; i < filenames.length; i++) {
      let name = filenames[i];
      if (isExcluded(name)) {
        continue;
      }

      let filePath = path.join(dir, name);

      let stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        enqueue(filePath);
      } else if (name.endsWith(".marko")) {
        await migrateTemplate(filePath, context);
      }
    }

    await context.events.emitAsync("afterMigrateDirectory", {
      dir
    });

    console.log("Done migrating directory:", relativePath(dir));
  }

  enqueue(rootDir);

  while (queue.length) {
    let dir = dequeue();
    await migrateDir(dir);
  }
}

function loadTransformers(tagOrAttr, context) {
  let transformersDirname = path.join(__dirname, "transformers", tagOrAttr);
  let filename = fs.readdirSync(transformersDirname);
  filename.forEach(filename => {
    let parts = /^([^_]+)(?:_(.+))?.js$/.exec(filename);
    if (!parts) {
      return;
    }

    let match = parts[1];

    filename = path.join(transformersDirname, filename);
    let transform = require(filename);

    if (tagOrAttr === "tag") {
      context.registerTagTransform(match, transform);
    } else {
      context.registerAttrTransform(match, transform);
    }
  });
}

async function migrate(options) {
  options = options || {};

  let logFile;
  let logger = logging.begin();

  let rootDir;

  if (options.dir) {
    rootDir = getRootDir(options.dir);
  } else if (options.template) {
    rootDir = getRootDir(path.dirname(options.dir));
  }

  let context = new MigrateContext(options, logger, rootDir);

  await loadTasks(context);
  await loadTransformers("tag", context);
  await loadTransformers("attr", context);

  console.log("Migrating project...");

  await context.events.emitAsync("beforeMigrateProject");

  let html;

  if (options.template) {
    html = await migrateTemplate(options.template, context);
  } else if (options.dir) {
    logFile = path.join(options.dir, "marko-migrate.log");
    await migrateDirTree(options.dir, context);
  }

  await context.writeModifiedTemplatesToDisk();

  await context.events.emitAsync("afterMigrateProject");

  var results = logger.end();

  console.log(results.output);

  if (logFile) {
    fs.writeFileSync(logFile, results.outputNoColor, { encoding: "utf8" });
  }

  if (results.warningCount) {
    console.log(chalk.red.bold(`Migration completed with warning(s):`));
  } else {
    console.log(chalk.green("Migration completed successfully!:"));
  }

  console.log(chalk.yellow.bold(`- ${results.warningCount} warning(s)`));
  console.log(chalk.red.bold(`- ${results.errorCount} error(s)`));
  console.log(
    chalk.magenta.bold(`- ${results.pendingTaskCount} remaining task(s)`)
  );

  return {
    html,
    success: results.errorCount === 0
  };
}

module.exports = migrate;
