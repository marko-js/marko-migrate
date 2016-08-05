'use strict';
require('shelljs/global');

var chai = require('chai');
chai.config.includeStack = true;
var path = require('path');
var markoMigrate = require('../');


function migrateProject(name) {
    var targetDir = path.join(__dirname, `temp/${name}`);
    var srcDir = path.join(__dirname, `fixtures/test-projects/${name}`);

    rm('-rf', targetDir);

    mkdir('-p', targetDir);

    cp('-R', srcDir, path.dirname(targetDir));

    markoMigrate.migrateProject(targetDir);
}

describe('marko-migrate/migrate-project' , function() {
    it('todomvc-marko', function() {
        migrateProject('todomvc-marko');
    });

    it('migrated-dependency', function() {
        migrateProject('migrated-dependency');
    });

    it('bad-taglib-body-property', function() {
        migrateProject('bad-taglib-body-property');
    });

    it('unmigrated-dependencies', function() {
        migrateProject('unmigrated-dependencies');
    });

    it('missing-dependency', function() {
        migrateProject('missing-dependency');
    });

    it('taglib-outside-project', function() {
        migrateProject('taglib-outside-project');
    });

    it('bad-template', function() {
        migrateProject('bad-template');
    });

    it('bad-taglib', function() {
        migrateProject('bad-taglib');
    });

    it.only('npm-shrinkwrap', function() {
        migrateProject('npm-shrinkwrap');
    });
});
