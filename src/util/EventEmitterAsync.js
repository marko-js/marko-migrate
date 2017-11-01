const EventEmitter = require("events");

class EventEmitterAsync extends EventEmitter {
  constructor(compileContext, options) {
    super();
  }

  async emitAsync(name, arg) {
    var wrappedArg = arg == null ? {} : Object.create(arg);
    wrappedArg.await = function(promise) {
      promises.push(promise);
    };

    let promises = [];
    this.emit(name, wrappedArg);

    await Promise.all(promises);
  }
}

module.exports = EventEmitterAsync;
