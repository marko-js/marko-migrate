function create(__helpers) {
  var __widgetType = {
          name: "/src/components/app-footer",
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
      attr = __helpers.a,
      attrs = __helpers.as,
      classAttr = __helpers.ca,
      escapeXmlAttr = __helpers.xa;

  return function render(data, out) {
    w_widget({
        type: __widgetType,
        id: "footer",
        _cfg: data.widgetConfig,
        _state: data.widgetState,
        _props: data.widgetProps,
        _body: data.widgetBody,
        renderBody: function renderBody(out, widget) {
          out.w("<footer" +
            attr("id", widget.id) +
            attrs(__widgetAttrs(widget)) +
            "><span id=\"todo-count\"><strong>" +
            escapeXml(data.remainingCount) +
            "</strong>" +
            escapeXml(data.remainingTodosWord) +
            " left</span><ul id=\"filters\"><li><a href=\"#/\"" +
            classAttr(data.filter === "all" ? "selected" : "") +
            " data-w-onclick=\"handleAllFilterClick|" +
            escapeXmlAttr(widget.id) +
            "\">All</a></li><li><a href=\"#/active\"" +
            classAttr(data.filter === "active" ? "selected" : "") +
            " data-w-onclick=\"handleActiveFilterClick|" +
            escapeXmlAttr(widget.id) +
            "\">Active</a></li><li><a href=\"#/completed\"" +
            classAttr(data.filter === "completed" ? "selected" : "") +
            " data-w-onclick=\"handleCompletedFilterClick|" +
            escapeXmlAttr(widget.id) +
            "\">Completed</a></li></ul>");

          if (data.completedCount > 0) {
            out.w("<button id=\"clear-completed\" data-w-onclick=\"handleClearCompletedClick|" +
              escapeXmlAttr(widget.id) +
              "\">Clear completed (" +
              escapeXml(data.completedCount) +
              ")</button>");
          }

          out.w("</footer>");
        }
      }, out);
  };
}

(module.exports = require("marko").c(__filename)).c(create);
