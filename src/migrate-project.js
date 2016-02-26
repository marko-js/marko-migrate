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


function migrateProject(rootDir) {

    var pkgPath = path.join(rootDir, 'package.json');

    var logger = logging.begin();

    function updatePkgDependencies(pkg, dependenciesType, logEvent) {
        let dependencies = pkg[dependenciesType];

        if (!dependencies) {
            return;
        }

        if (dependencies.hasOwnProperty('marko')) {
            logEvent.info(`Updated "marko" version: ${dependencies.marko} → ${MARKO_VERSION} (${dependenciesType})`);
            dependencies.marko = MARKO_VERSION;

        }

        if (dependencies.hasOwnProperty('marko-widgets')) {
            logEvent.info(`Updated "marko-widgets" version: ${dependencies['marko-widgets']} → ${MARKO_WIDGETS_VERSION} (${dependenciesType})`);
            dependencies['marko-widgets'] = MARKO_WIDGETS_VERSION;
        }

        if (dependencies.hasOwnProperty('lasso')) {
            logEvent.info(`Updated "lasso" version: ${dependencies.lasso} → ${LASSO_VERSION} (${dependenciesType})`);
            dependencies.lasso = LASSO_VERSION;
        }
    }

    if (fs.existsSync(pkgPath)) {
        let pkg = require(pkgPath);
        let logEvent = logger.modified(pkgPath);

        updatePkgDependencies(pkg, 'dependencies', logEvent);
        updatePkgDependencies(pkg, 'devDependencies', logEvent);
        updatePkgDependencies(pkg, 'peerDependencies', logEvent);

        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), { encoding: 'utf8' });
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

                let transformedSrc = transformTemplate(filePath, {
                    logger: logger
                });
                fs.writeFileSync(filePath, transformedSrc, { encoding: 'utf8' });
                logger.modified(filePath);
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
        console.log(chalk.red.bold(`Migration completed with ${results.warningCount} warning(s)`));
    } else {
        console.log(chalk.green('Migration completed successfully!'));
    }



}

module.exports = migrateProject;