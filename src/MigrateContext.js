const EventEmitterAsync = require("./util/EventEmitterAsync");
const fs = require("fs");
const { getRootDir } = require("lasso-package-root");

class MigrateContext {
  constructor(options, logger, rootDir) {
    this.options = options || {};
    this.logger = logger;
    this.global = {};
    this.events = new EventEmitterAsync();
    this.tagTransformers = {};
    this.attrTransformers = {};
    this.queuedTemplateFiles = [];
    this.template = null; // TemplateContext when transforming a template
    this.rootDir = rootDir || process.cwd();
  }

  registerTagTransform(tagName, transform) {
    if (!tagName) {
      tagName = "ANY";
    }

    let tagTransformers =
      this.tagTransformers[tagName] || (this.tagTransformers[tagName] = []);
    tagTransformers.push(transform);
  }

  registerAttrTransform(attrName, transform) {
    let attrTransformers =
      this.attrTransformers[attrName] || (this.attrTransformers[attrName] = []);
    attrTransformers.push(transform);
  }

  runHtmlElementTransforms(el, methodName) {
    let tagName = el.tagName;
    let tagTransformers = this.tagTransformers[tagName] || [];
    if (this.tagTransformers.ANY) {
      tagTransformers = tagTransformers.concat(this.tagTransformers.ANY);
    }

    if (tagTransformers) {
      tagTransformers.forEach(tagTransformer => {
        if (tagTransformer && tagTransformer[methodName]) {
          let result = tagTransformer[methodName](el, this);
          if (result !== undefined) {
            el.detach();
          }
        }
      });
    }

    let attrs = el.getAttributes();
    attrs.forEach(attr => {
      let attrName = attr.name;
      let attrTransformers = this.attrTransformers[attrName];

      if (attrTransformers) {
        attrTransformers.forEach(attrTransformer => {
          if (attrTransformer && attrTransformer[methodName]) {
            attrTransformer[methodName](el, attr, this);
          }
        });
      }
    });
  }

  queueWriteTemplateFile(filePath, src) {
    this.queuedTemplateFiles.push({
      filePath,
      src
    });
  }

  async writeModifiedTemplatesToDisk() {
    console.log("Writing modified templates to disk...");

    let queuedTemplateFiles = this.queuedTemplateFiles;
    for (let entry of queuedTemplateFiles) {
      let filePath = entry.filePath;
      let transformedSrc = entry.src;
      fs.writeFileSync(filePath, transformedSrc, { encoding: "utf8" });
      this.logger.modified(filePath);
    }
  }

  isDirectoryInProject(dir) {
    return getRootDir(dir) === this.rootDir;
  }
}

module.exports = MigrateContext;
