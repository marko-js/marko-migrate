function create(__helpers) {
  var __widgetType = {
          name: "/src/components/app-main",
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
      attr = __helpers.a,
      attrs = __helpers.as,
      escapeXmlAttr = __helpers.xa,
      forEach = __helpers.f,
      app_todo_item = __loadTag(require("../app-todo-item"));

  return function render(data, out) {
    w_widget({
        type: __widgetType,
        id: "main",
        _cfg: data.widgetConfig,
        _state: data.widgetState,
        _props: data.widgetProps,
        _body: data.widgetBody,
        renderBody: function renderBody(out, widget) {
          out.w("<section" +
            attr("id", widget.id) +
            attrs(__widgetAttrs(widget)) +
            "><input id=\"toggle-all\" type=\"checkbox\"" +
            attr("checked", data.toggleAllChecked) +
            " data-w-onchange=\"handleToggleAllOnChange|" +
            escapeXmlAttr(widget.id) +
            "\"><label for=\"toggle-all\">Mark all as complete</label><ul id=\"todo-list\">");

          forEach(data.todos, function(todo) {
            __widgetArgs(out, widget.id, "todo-" + todo.todoData.id);
            app_todo_item({
                todoData: todo.todoData,
                isEditing: "todo.isEditing",
                editingTitle: todo.editingTitle
              }, out);
            _cleanupWidgetArgs(out);
          });

          out.w("</ul></section>");
        }
      }, out);
  };
}

(module.exports = require("marko").c(__filename)).c(create);
