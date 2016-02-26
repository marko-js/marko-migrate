function create(__helpers) {
  var __widgetType = {
          name: "/src/components/app-notifications-overlay",
          def: function() {
            return require("./");
          }
        },
      __markoWidgets = require("marko-widgets"),
      __widgetAttrs = __markoWidgets.attrs,
      __widgetArgs = require("marko-widgets/taglib/helpers/widgetArgs"),
      _cleanupWidgetArgs = __widgetArgs.cleanup,
      str = __helpers.s,
      empty = __helpers.e,
      notEmpty = __helpers.ne,
      escapeXml = __helpers.x,
      __loadTag = __helpers.t,
      w_widget = __loadTag(require("marko-widgets/taglib/widget-tag")),
      escapeXmlAttr = __helpers.xa,
      attr = __helpers.a,
      attrs = __helpers.as,
      app_notification = __loadTag(require("../app-notification"));

  return function render(data, out) {
    w_widget({
        type: __widgetType,
        _cfg: data.widgetConfig,
        _state: data.widgetState,
        _props: data.widgetProps,
        _body: data.widgetBody,
        renderBody: function renderBody(out, widget) {
          out.w("<div class=\"app-notifications-overlay" +
            escapeXmlAttr(data.visible ? " visible" : "") +
            "\"" +
            attr("id", widget.id) +
            attrs(__widgetAttrs(widget)) +
            "><div class=\"container\"" +
            attr("id", widget.elId("container")) +
            ">");

          __widgetArgs(out, widget.id, "asyncNotification");
          app_notification({
              showSpinner: "true",
              visible: "false",
              renderBody: function renderBody(out) {
                out.w("Synchronizing changes with server...");
              }
            }, out);
          _cleanupWidgetArgs(out);

          out.w("</div></div>");
        }
      }, out);
  };
}

(module.exports = require("marko").c(__filename)).c(create);
