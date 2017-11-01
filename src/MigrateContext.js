const EventEmitterAsync = require("./util/EventEmitterAsync");

class MigrateContext {
  constructor(options, logger) {
    this.options = options || {};
    this.logger = logger;
    this.global = {};
    this.events = new EventEmitterAsync();
    this.tagTransformers = {};
    this.attrTransformers = {};
    this.template = null; // TemplateContext when transforming a template
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
}

module.exports = MigrateContext;
