"use strict";

const cwd = process.cwd();
const path = require("path");
const chalk = require("chalk");
const stripAnsi = require("strip-ansi");

var colors = {
  modified: chalk.yellow,
  removed: chalk.red,
  created: chalk.green,
  moved: chalk.green,
  info: chalk.cyan,
  warn: chalk.yellow.bold,
  error: chalk.red.bold,
  task: chalk.yellow
};

class Event {
  constructor(type, message) {
    this.type = type;
    this.message = message;

    this.details = [];
  }

  info(message) {
    this.details.push({
      type: "info",
      message: message
    });
  }

  toString() {
    var type = this.type;
    var message = this.message;
    var details = this.details;

    var color = colors[type];

    var result = color(`[${type}]`) + ` ${message}\n`;

    if (details.length) {
      details.forEach(detail => {
        let color = colors.info; //[detail.type];
        result += `  - ${color(`[${detail.type}]`)} ${detail.message}\n`;
      });
    }

    return result;
  }
}

class Logger {
  constructor() {
    this.events = [];
    this.warnings = [];
    this.errors = [];
    this.pendingTasks = [];
  }

  modified(filename) {
    var relativePath = path.relative(cwd, filename);
    var event = new Event("modified", relativePath);
    this.events.push(event);
    return event;
  }

  removed(filename) {
    var relativePath = path.relative(cwd, filename);
    var event = new Event("removed", relativePath);
    this.events.push(event);
    return event;
  }

  created(filename) {
    var relativePath = path.relative(cwd, filename);
    var event = new Event("created", relativePath);
    this.events.push(event);
    return event;
  }

  moved(fromFilename, toFilename) {
    var fromRelativePath = path.relative(cwd, fromFilename);
    var toRelativePath = path.relative(cwd, toFilename);
    var event = new Event(
      "moved",
      `${chalk.red(fromRelativePath)} → ${chalk.green(toRelativePath)}`
    );
    this.events.push(event);
    return event;
  }

  warn(message) {
    var event = new Event("warn", message);
    this.warnings.push(event);
    return event;
  }

  error(message) {
    var event = new Event("error", message);
    this.errors.push(event);
    return event;
  }

  unmigrated(filename) {
    var event = new Event(
      "task",
      `The following installed package should now be migrated: ${path.relative(
        cwd,
        filename
      )}`
    );
    event.migrateTaglibFile = filename;
    this.pendingTasks.push(event);
    return event;
  }

  task(message) {
    var event = new Event("task", message);
    this.pendingTasks.push(event);
    return event;
  }

  toString() {
    return;
  }

  end() {
    let output = this.events.join("");
    let warnings = this.warnings;
    let errors = this.errors;
    let pendingTasks = this.pendingTasks;

    if (pendingTasks.length) {
      output +=
        colors.task.underline("\nREMAINING TASKS:\n") + pendingTasks.join("");
    }

    if (warnings.length) {
      output += colors.warn.underline("\nWARNINGS:\n") + warnings.join("");
    }

    if (errors.length) {
      output += colors.error.underline("\nERRORS:\n") + errors.join("");
    }

    return {
      output,
      outputNoColor: stripAnsi(output),
      warningCount: warnings.length,
      errorCount: errors.length,
      pendingTaskCount: pendingTasks.length
    };
  }
}

var logger = null;

exports.begin = function() {
  return (logger = new Logger());
};

exports.end = function() {
  var result = logger.end();
  logger = null;
  return result;
};

exports.getLogger = function() {
  return logger;
};

exports.hasLogger = function() {
  return logger != null;
};
