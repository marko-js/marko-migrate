function create(__helpers) {
  var str = __helpers.s,
      empty = __helpers.e,
      notEmpty = __helpers.ne,
      escapeXml = __helpers.x,
      __browser_json = require.resolve("./browser.json"),
      __loadTag = __helpers.t,
      lasso_page = __loadTag(require("lasso/taglib/page-tag")),
      lasso_head = __loadTag(require("lasso/taglib/head-tag")),
      async_fragment = __loadTag(require("marko/taglibs/async/async-fragment-tag")),
      app = __loadTag(require("../../components/app")),
      app_notifications_overlay = __loadTag(require("../../components/app-notifications-overlay")),
      lasso_body = __loadTag(require("lasso/taglib/body-tag")),
      init_widgets = __loadTag(require("marko-widgets/taglib/init-widgets-tag")),
      browser_refresh = __loadTag(require("browser-refresh-taglib/refresh-tag"));

  return function render(data, out) {
    lasso_page({
        packagePath: __browser_json,
        dirname: __dirname,
        filename: __filename
      }, out);

    out.w("<html html-doctype=\"html\" lang=\"en\" data-framework=\"marko\"><head><meta charset=\"utf-8\"><title>Marko • TodoMVC</title>");

    lasso_head({}, out);

    out.w("</head><body>");

    async_fragment({
        dataProvider: data.todoStateProvider,
        _name: "data.todoStateProvider",
        renderBody: function renderBody(out, appState) {
          out.w("<section id=\"todoapp\">");

          app({
              state: appState
            }, out);

          out.w("</section>");
        }
      }, out);

    app_notifications_overlay({}, out);

    out.w("<footer id=\"info\"><p>Double-click to edit a todo</p><p>Created by <a href=\"http://github.com/patrick-steele-idem/\">Patrick Steele-Idem</a> and <a href=\"https://github.com/philidem/\">Phil Gates-Idem</a></p><p>Part of <a href=\"http://todomvc.com\">TodoMVC</a></p></footer>");

    lasso_body({}, out);

    init_widgets({}, out);

    browser_refresh({}, out);

    out.w("</body></html>");
  };
}

(module.exports = require("marko").c(__filename)).c(create);
