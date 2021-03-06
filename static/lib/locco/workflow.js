// Generated by CoffeeScript 1.7.1
(function() {
  var Action, Workflow, _, _module,
    __slice = [].slice;

  _ = require('../../general/chocodash');

  Action = require('../locco/action');

  Workflow = _.prototype({
    constructor: function(options) {
      var connect, is_ready, sync;
      if (options == null) {
        options = {};
      }
      is_ready = new _.Publisher;
      this.actors = {};
      this.ready = function(func) {
        if (this.ws.readyState === 1) {
          return setTimeout(((function(_this) {
            return function() {
              return func.call(_this);
            };
          })(this)), 0);
        } else {
          return is_ready.subscribe(((function(_this) {
            return function() {
              return func.call(_this);
            };
          })(this)));
        }
      };
      sync = function() {
        var actions;
        actions = _["do"].flush();
        if (actions == null) {

        }
      };
      if (typeof module === "undefined" || module === null) {
        if ($ && $.websocket) {
          (connect = (function(_this) {
            return function() {
              var callbacks, id;
              callbacks = {};
              id = 1;
              _this.message_id = function(callback) {
                callbacks[id.toString()] = callback;
                return id++;
              };
              _this.ws = $.websocket("wss://" + window.location.host + "/~");
              _this.ws.onmessage = function(evt) {
                var callback, data;
                if (options.debug) {
                  if (evt.data !== '') {
                    console.log("Message is received:" + evt.data);
                  }
                }
                data = _.parse(evt.data);
                if ((data != null) && data.result !== void 0 && data.id) {
                  callback = callbacks[data.id];
                  callback(data.result);
                  return delete callbacks[data.id];
                }
              };
              _this.ws.onopen = function() {
                if (options.debug) {
                  console.log("Connection opened");
                }
                return is_ready.notify();
              };
              return _this.ws.onclose = function() {
                if (options.debug) {
                  console.log("Connection closed. Reopening...");
                }
                return setTimeout(connect, 300);
              };
            };
          })(this))();
          return setInterval(sync, 300);
        }
      }
    },
    enter: function(actor) {
      return this.actors[actor.id()] = actor;
    },
    broadcast: function() {
      var callback, location, module, name, object, param, params, service, _i, _ref;
      object = arguments[0], service = arguments[1], params = 4 <= arguments.length ? __slice.call(arguments, 2, _i = arguments.length - 1) : (_i = 2, []), callback = arguments[_i++];
      if (typeof window !== "undefined" && window !== null) {
        location = null;
        _ref = window.modules;
        for (name in _ref) {
          module = _ref[name];
          if (module === object.constructor) {
            location = 'general/' + name;
            break;
          }
        }
        if ((location != null) && (service != null)) {
          params = ((function() {
            var _j, _len, _results;
            _results = [];
            for (_j = 0, _len = params.length; _j < _len; _j++) {
              param = params[_j];
              _results.push(_.param(param));
            }
            return _results;
          })()).join('&');
          if (params.length > 0) {
            params = '&' + params;
          }
          return this.ws.send("{url:'/" + location + "?" + service + params + "', id:" + (this.message_id(callback)) + "}");
        }
      }
    },
    execute: function(action) {
      var _i, _len, _ref, _results;
      _ref = action.actions;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        action = _ref[_i];
        switch (so) {
          case 'go':
            break;
          default:
            _results.push(void 0);
        }
      }
      return _results;
    }
  });

  Workflow.main = new Workflow;

  Workflow.actor = function(id) {
    return Workflow.main.actors[id];
  };

  _module = typeof window !== "undefined" && window !== null ? window : module;

  if (_module.exports != null) {
    _module.exports = Workflow;
  } else {
    if (window.Locco == null) {
      window.Locco = {};
    }
    window.Locco.Workflow = Workflow;
  }

}).call(this);
