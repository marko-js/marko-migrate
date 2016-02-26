function create(__helpers) {
  var __widgetType = {
          name: "/src/components/app-todo-item",
          def: function() {
            return require("./");
          }
        },
      __markoWidgets = require("marko-widgets"),
      __widgetAttrs = __markoWidgets.attrs,
      str = __helpers.s,
      empty = __helpers.e,
      notEmpty = __helpers.ne,
      escapeXml = __helpers.x,
      __loadTag = __helpers.t,
      w_widget = __loadTag(require("marko-widgets/taglib/widget-tag")),
      classAttr = __helpers.ca,
      attr = __helpers.a,
      attrs = __helpers.as,
      escapeXmlAttr = __helpers.xa,
      w_preserve = __loadTag(require("marko-widgets/taglib/preserve-tag"));

  return function render(data, out) {
    w_widget({
        type: __widgetType,
        hasDomEvents: 1,
        _cfg: data.widgetConfig,
        _state: data.widgetState,
        _props: data.widgetProps,
        _body: data.widgetBody,
        renderBody: function renderBody(out, widget) {
          out.w("<li" +
            classAttr(data.liClassName) +
            attr("id", widget.id) +
            attrs(__widgetAttrs(widget)) +
            "><div class=\"view\"><input class=\"toggle\" type=\"checkbox\"" +
            attr("checked", data.completed) +
            " aria-label=\"Toggle todo completed\" data-w-onchange=\"handleCheckboxChange|" +
            escapeXmlAttr(widget.id) +
            "\"><label data-w-ondblclick=\"handleLabelDblClick|" +
            escapeXmlAttr(widget.id) +
            "\">" +
            escapeXml(data.title) +
            "</label><button class=\"destroy\" aria-label=\"Delete todo\" data-w-onclick=\"handleDestroyClick|" +
            escapeXmlAttr(widget.id) +
            "\"></button></div>");

          var __widgetId0 = widget.elId("titleInput");
          w_preserve({
              id: __widgetId0,
              renderBody: function renderBody(out) {
                widget.addDomEvent("blur", "handleInputBlur", "#" + __widgetId0);
                
                out.w("<input title=\"Enter the new todo title\" type=\"text\" class=\"edit\"" +
                  attr("value", data.editingTitle) +
                  attr("id", __widgetId0) +
                  " data-w-onchange=\"handleInputChange|" +
                  escapeXmlAttr(widget.id) +
                  "\" data-w-onkeydown=\"handleInputKeyDown|" +
                  escapeXmlAttr(widget.id) +
                  "\">");
              }
            }, out);

          out.w("</li>");
        }
      }, out);
  };
}

(module.exports = require("marko").c(__filename)).c(create);
