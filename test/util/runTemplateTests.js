"use strict";

const chai = require("chai");
chai.config.includeStack = true;
const path = require("path");
const markoMigrate = require("../../");
const shell = require("shelljs");
const resolveFrom = require("resolve-from");
const { existsSync } = require("fs");
const child_process = require("child_process");
const spawn = child_process.spawn;

process.on("unhandledRejection", err => console.log(err));

module.exports = function(markoVersion) {
  describe(path.basename(__filename), () => {
    before(async () => {
      let projectDir = path.join(__dirname, `../${markoVersion}`);
      let nodeModulesDir = path.join(projectDir, "node_modules");
      if (existsSync(nodeModulesDir) === false) {
        return new Promise((resolve, reject) => {
          const process = spawn("npm", ["install"], {
            cwd: projectDir
          });

          process.stdout.on("data", data => {
            console.log(data);
          });

          process.stderr.on("data", data => {
            console.error(data);
          });

          process.on("close", code => {
            resolve();
          });
        });
      }
    });

    var srcAutoTestDir = path.join(
      __dirname,
      `../autotest-templates-${markoVersion}`
    );
    var targetAutoTestDir = path.join(
      __dirname,
      `../${markoVersion}/autotest-templates`
    );

    require("./autotest").scanDir(srcAutoTestDir, async (dir, helpers) => {
      let name = path.basename(dir);
      let srcDir = path.join(srcAutoTestDir, name);
      let targetDir = path.join(targetAutoTestDir, name);
      let testModulePath = resolveFrom.silent(srcDir, "./test.js");
      let test;
      if (testModulePath) {
        test = require(testModulePath);
      }

      shell.rm("-rf", targetDir);
      shell.mkdir("-p", targetDir);
      shell.cp("-R", srcDir, path.dirname(targetDir));

      let inputPath = path.join(targetDir, "template.marko");

      let result = await markoMigrate({
        template: inputPath,
        syntax: "html",
        autoPascalCase: true
      });

      helpers.compare(result.html, ".marko");

      if (test && test.check) {
        await test.check(targetDir);
      }
    });
  });
};
