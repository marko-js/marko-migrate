function create(__helpers) {
  var str = __helpers.s,
      empty = __helpers.e,
      notEmpty = __helpers.ne,
      escapeXml = __helpers.x,
      __loadTag = __helpers.t,
      browser_refresh = __loadTag(require("browser-refresh-taglib/refresh-tag"));

  return function render(data, out) {
    out.w("<html html-doctype=\"html\" lang=\"en\" data-framework=\"marko\"><head><meta charset=\"utf-8\"><title>Error | Marko • TodoMVC</title></head><body><pre>\n            " +
      str(data.stackTrace) +
      "\n        </pre>");

    browser_refresh({}, out);

    out.w("</body></html>");
  };
}

(module.exports = require("marko").c(__filename)).c(create);
