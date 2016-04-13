'use strict';

require('shelljs/global');
var path = require('path');
var fs = require('fs');
var transformTemplate = require('./transform-template');
var logging = require('./logging');
var chalk = require('chalk');

var semver = require('semver');
const MARKO_VERSION = '^3.0.3';
const MARKO_WIDGETS_VERSION = '^6.0.0';
const LASSO_VERSION = '^2.0.0';

function relativePath(filename) {
    return path.relative(process.cwd(), filename);
}

function isExcluded(name) {
    if (name === 'node_modules') {
        return true;
    }
    if (name.startsWith('.')) {
        return true;
    }
}



function migrateProject(rootDir, options) {
    options = options || {};

    var pkgPath = path.join(rootDir, 'package.json');

    var logger = logging.begin();
    var logFile = path.join(rootDir, 'marko-migrate.log');

    function finish() {
        logger.task(`Delete log file: ${relativePath(logFile)}`);

        var results = logger.end();

        console.log(results.output);

        fs.writeFileSync(logFile, results.outputNoColor, { encoding: 'utf8' });

        if (results.warningCount) {
            console.log(chalk.red.bold(`Migration completed with warning(s):`));
        } else {
            console.log(chalk.green('Migration completed successfully!:'));
        }

        console.log(chalk.red.bold(`- ${results.warningCount} warning(s)`));
        console.log(chalk.yellow.bold(`- ${results.pendingTaskCount} remaining task(s)`));
    }


    if (fs.existsSync(logFile)) {
        logger.warn(`Project has already been migrated! Found "${relativePath(logFile)}". Aborting.`);
        finish();
        return;
    }

    var backupDir = path.join(rootDir, '.marko-migrate-backup');

    function backup(dir, targetDir) {
        var files = fs.readdirSync(dir);
        files.forEach((file) => {
            if (isExcluded(file)) {
                return;
            }

            var sourceFile = path.join(dir, file);
            cp('-R', sourceFile, targetDir + '/');
        });
    }

    backup(rootDir, backupDir);
    logger.task(`Delete backup directory: ${relativePath(backupDir)}`);

    var cacheDir = path.join(rootDir, '.cache/');
    rm('-rf', cacheDir);
    logger.removed(cacheDir);

    function updatePkgDependencies(pkg, dependenciesType, modifiedList) {
        let dependencies = pkg[dependenciesType];

        if (!dependencies) {
            return false;
        }

        compare('marko', MARKO_VERSION);
        compare('marko-widgets', MARKO_WIDGETS_VERSION);
        compare('lasso', LASSO_VERSION);

        function compare(name, required){
            if (!dependencies.hasOwnProperty(name)) {
                return;
            }

            var current = dependencies[name];
            var required_version = required.substr(1); /* converted from range (^x.x.x) to version (x.x.x) */

            /* return if `required_version` is less than `current` (treated as a range) */
            if (semver.ltr(required_version, current)) {
                return;
            }

            modifiedList.push(`Updated "${name}" version: ${current} → ${required} (in "${dependenciesType}")`);
            dependencies[name] = required;
        }
    }

    if (fs.existsSync(pkgPath)) {
        let pkg = require(pkgPath);

        var modifiedList = [];

        updatePkgDependencies(pkg, 'dependencies', modifiedList);
        updatePkgDependencies(pkg, 'devDependencies', modifiedList);
        updatePkgDependencies(pkg, 'peerDependencies', modifiedList);

        if (modifiedList.length) {
            let logEvent = logger.modified(pkgPath);
            modifiedList.forEach((message) => {
                logEvent.info(message);
            });

            fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), { encoding: 'utf8' });

            logger.task('Run "npm install" to install the latest versions of packages.');
        }
    }

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

    var markoTaglibs = [];

    function migrateDir(dir) {
        var filenames = fs.readdirSync(dir);
        filenames.forEach((name) => {
            if (isExcluded(name)) {
                return;
            }

            let filePath = path.join(dir, name);

            let stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                enqueue(filePath);
                return;
            }

            if (name === 'marko-taglib.json') {
                markoTaglibs.push({
                    filePath: filePath,
                    newFilePath: path.join(dir, 'marko.json')
                });
            } else if (name.endsWith('.marko')) {

                try {
                    let transformedSrc = transformTemplate(filePath, {
                        logger: logger,
                        syntax: options.syntax
                    });
                    fs.writeFileSync(filePath, transformedSrc, { encoding: 'utf8' });
                    logger.modified(filePath);
                } catch(e) {
                    logger.warn(`Unable to migrate template at path "${relativePath(filePath)}". Error: ${e.toString()}`);
                }

            }
        });
    }

    enqueue(rootDir);

    while(queue.length) {
        let dir = dequeue();
        migrateDir(dir);
    }

    markoTaglibs.forEach((taglibInfo) => {
        logger.moved(taglibInfo.filePath, taglibInfo.newFilePath);
        mv(taglibInfo.filePath, taglibInfo.newFilePath);
    });

    finish();
}

module.exports = migrateProject;