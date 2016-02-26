'use strict';

require('shelljs/global');
var path = require('path');
var fs = require('fs');
var transformTemplate = require('./transform-template');
var logging = require('./logging');
var chalk = require('chalk');

const MARKO_VERSION = '^3.0.0-rc.1';
const MARKO_WIDGETS_VERSION = '^6.0.0-alpha.1';
const LASSO_VERSION = '^2.0.0';

function relativePath(filename) {
    return path.relative(process.cwd(), filename);
}

function migrateProject(rootDir, options) {
    options = options || {};

    var pkgPath = path.join(rootDir, 'package.json');

    var logger = logging.begin();

    function updatePkgDependencies(pkg, dependenciesType, modifiedList) {
        let dependencies = pkg[dependenciesType];

        if (!dependencies) {
            return false;
        }

        if (dependencies.hasOwnProperty('marko')) {
            modifiedList.push(`Updated "marko" version: ${dependencies.marko} → ${MARKO_VERSION} (in "${dependenciesType}")`);
            dependencies.marko = MARKO_VERSION;
        }

        if (dependencies.hasOwnProperty('marko-widgets')) {
            modifiedList.push(`Updated "marko-widgets" version: ${dependencies['marko-widgets']} → ${MARKO_WIDGETS_VERSION} (in "${dependenciesType}")`);
            dependencies['marko-widgets'] = MARKO_WIDGETS_VERSION;
        }

        if (dependencies.hasOwnProperty('lasso')) {
            modifiedList.push(`Updated "lasso" version: ${dependencies.lasso} → ${LASSO_VERSION} (in "${dependenciesType}")`);
            dependencies.lasso = LASSO_VERSION;
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

    function isExcluded(name) {
        if (name === 'node_modules') {
            return true;
        }
        if (name.startsWith('.')) {
            return true;
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

    var results = logger.end();

    console.log(results.output);

    if (results.warningCount) {
        console.log(chalk.red.bold(`Migration completed with warning(s):`));
    } else {
        console.log(chalk.green('Migration completed successfully!:'));
    }

    console.log(chalk.red.bold(`- ${results.warningCount} warning(s)`));
    console.log(chalk.yellow.bold(`- ${results.pendingTaskCount} pending task(s)`));
}

module.exports = migrateProject;