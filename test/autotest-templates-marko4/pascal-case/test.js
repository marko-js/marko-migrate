const fs = require("fs");
const path = require("path");
const { expect } = require("chai");
exports.check = function(dir) {
  let componentFiles = fs.readdirSync(path.join(dir, "components"));
  componentFiles.sort();
  expect(componentFiles).to.deep.equal(["Bar", "Baz.marko", "Foo"]);
};
