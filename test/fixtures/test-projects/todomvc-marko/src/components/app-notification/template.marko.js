function create(__helpers) {
  var __widgetType = {
          name: "/src/components/app-notification",
          def: function() {
            return require("./");
          }
        },
      __markoWidgets = require("marko-widgets"),
      __widgetAttrs = __markoWidgets.attrs,
      __widgetBody = require("marko-widgets/taglib/helpers/widgetBody"),
      str = __helpers.s,
      empty = __helpers.e,
      notEmpty = __helpers.ne,
      escapeXml = __helpers.x,
      __loadTag = __helpers.t,
      w_widget = __loadTag(require("marko-widgets/taglib/widget-tag")),
      escapeXmlAttr = __helpers.xa,
      attr = __helpers.a,
      attrs = __helpers.as;

  return function render(data, out) {
    w_widget({
        type: __widgetType,
        body: 0,
        _cfg: data.widgetConfig,
        _state: data.widgetState,
        _props: data.widgetProps,
        _body: data.widgetBody,
        renderBody: function renderBody(out, widget) {
          out.w("<div class=\"app-notification" +
            escapeXmlAttr(data.visible ? " visible" : "") +
            "\"" +
            attr("id", widget.id) +
            attrs(__widgetAttrs(widget)) +
            "><div class=\"notification-bd\"><div class=\"text\"><span" +
            attr("id", widget.elId(0)) +
            ">");

          __widgetBody(out, widget.elId(0), data.widgetBody, widget);

          out.w("</span>");

          if (data.dismissable) {
            out.w("<a href=\"#dismiss\"" +
              attr("data-id", data.id) +
              " data-w-onclick=\"handleDismissClick|" +
              escapeXmlAttr(widget.id) +
              "\"><span class=\"close-icon\"></span></a>");
          }

          out.w("</div>");

          if (data.showSpinner) {
            out.w("<div class=\"spinner\"></div>");
          }

          out.w("</div></div>");
        }
      }, out);
  };
}

(module.exports = require("marko").c(__filename)).c(create);
