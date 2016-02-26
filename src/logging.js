'use strict';
var cwd = process.cwd();
var path = require('path');
var chalk = require('chalk');

var colors = {
    modified: chalk.yellow,
    removed: chalk.red,
    created: chalk.green,
    moved: chalk.green,
    info: chalk.cyan,
    warn: chalk.red.bold
};

class Event {
    constructor(type, message) {
        this.type = type;
        this.message = message;

        this.details = [];
    }

    info(message) {
        this.details.push({
            type: 'info',
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
            details.forEach((detail) => {
                let color = colors.info;//[detail.type];
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
    }

    modified(filename) {
        var relativePath = path.relative(cwd, filename);
        var event = new Event('modified', relativePath);
        this.events.push(event);
        return event;
    }

    removed(filename) {
        var relativePath = path.relative(cwd, filename);
        var event = new Event('removed', relativePath);
        this.events.push(event);
        return event;
    }

    created(filename) {
        var relativePath = path.relative(cwd, filename);
        var event = new Event('created', relativePath);
        this.events.push(event);
        return event;
    }

    moved(fromFilename, toFilename) {
        var fromRelativePath = path.relative(cwd, fromFilename);
        var toRelativePath = path.relative(cwd, toFilename);
        var event = new Event('moved', `${chalk.red(fromRelativePath)} → ${chalk.green(toRelativePath)}`);
        this.events.push(event);
        return event;
    }

    warn(message) {
        var event = new Event('warn', message);
        this.warnings.push(event);
        return event;
    }

    toString() {
        return ;
    }

    end() {
        var output = this.events.join('');
        var warnings = this.warnings;

        if (warnings.length) {
            output += colors.warn.underline('\nWARNINGS:\n') + warnings.join('');
        }

        return {
            output,
            warningCount: warnings.length
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