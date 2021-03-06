// Generated by CoffeeScript 1.7.1
(function() {
  var Chocokup, Interface, _, _module,
    __hasProp = {}.hasOwnProperty,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('../../general/chocodash');

  Chocokup = require('../../general/chocokup');

  Interface = _.prototype({
    constructor: function(service) {
      var item, name;
      if (typeof service === 'function') {
        service = {
          action: service
        };
      }
      if (service != null) {
        if (service.defaults != null) {
          if (typeof service.defaults === 'function') {
            this.defaults = service.defaults;
          } else {
            this.defaults = _.defaults(this.defaults, service.defaults);
          }
        }
        if (service.locks != null) {
          this.locks = _.defaults(this.locks, service.locks);
        }
        if (service.values != null) {
          this.values = _.defaults(this.values, service.values);
        }
        if (service.steps != null) {
          this.steps = _.defaults(this.steps, service.steps);
        }
        for (name in service) {
          item = service[name];
          if (name !== 'defaults' && name !== 'locks' && name !== 'values' && name !== 'steps') {
            this[name] = item;
          }
        }
      }
    },
    bind: function(actor, document, name) {
      this.name = name;
      if (!((this.actor != null) && (this.document != null))) {
        this.actor = actor;
        this.document = document;
        switch (_.type(this.update)) {
          case _.Type.Function:
            return this.observe(this.update);
          case _.Type.String:
            return this.observe((function(_this) {
              return function(html) {
                $(_this.update).html(html);
              };
            })(this));
        }
      }
    },
    review: function(bin, scope, reaction, next) {
      var check, check_services, review_result, _ref, _ref1;
      check = {
        defaults: (function(_this) {
          return function(object, defaults) {
            var set;
            if (typeof defaults === 'function') {
              defaults = defaults.call(_this);
            }
            set = function(o, d) {
              var dk, dv;
              for (dk in d) {
                if (!__hasProp.call(d, dk)) continue;
                dv = d[dk];
                if (_.isBasicObject(o[dk]) && _.isBasicObject(dv)) {
                  set(o[dk], dv);
                } else {
                  if (o[dk] == null) {
                    o[dk] = dv;
                  }
                }
              }
              return o;
            };
            return set(object, defaults);
          };
        })(this),
        locks: (function(_this) {
          return function(keys, locks) {
            var lock, _i, _len;
            if (locks == null) {
              return true;
            }
            if (typeof locks === 'function') {
              locks = locks.call(_this);
            }
            for (_i = 0, _len = locks.length; _i < _len; _i++) {
              lock = locks[_i];
              if (__indexOf.call(keys, lock) < 0) {
                return false;
              }
            }
            return true;
          };
        })(this),
        values: function(bin, controller) {
          return controller.call(bin);
        }
      };
      check_services = function() {
        var was_synchronous;
        was_synchronous = true;
        _.serialize(function(step) {
          var check_service;
          check_service = function(service_bin, local_scope) {
            var name, service, _local_scope;
            for (name in service_bin) {
              service = service_bin[name];
              if (service instanceof Interface) {
                (function(_bin, _name, _service, _local_scope) {
                  return step(function(next_service) {
                    var item, service_result, _base, _i, _j, _len, _len1, _next_service;
                    if ((_base = _bin[_name]).bin == null) {
                      _base.bin = {
                        __: _bin.__
                      };
                    }
                    if (_local_scope != null) {
                      for (_i = 0, _len = _local_scope.length; _i < _len; _i++) {
                        item = _local_scope[_i];
                        scope.global.push(item);
                      }
                      _next_service = next_service;
                      next_service = function() {
                        var _j, _len1;
                        for (_j = 0, _len1 = _local_scope.length; _j < _len1; _j++) {
                          item = _local_scope[_j];
                          scope.global.pop();
                        }
                        return _next_service();
                      };
                    }
                    service_result = _service.review(_bin[_name].bin, scope, reaction, next_service);
                    if (service_result === next_service) {
                      was_synchronous = false;
                    } else {
                      if (_local_scope != null) {
                        for (_j = 0, _len1 = _local_scope.length; _j < _len1; _j++) {
                          item = _local_scope[_j];
                          scope.global.pop();
                        }
                      }
                      next_service();
                    }
                    return service_result;
                  });
                })(service_bin, name, service, local_scope != null ? local_scope.slice(0) : null);
              } else {
                if (_.isBasicObject(service)) {
                  _local_scope = local_scope != null ? local_scope.slice(0) : [];
                  _local_scope.push(name);
                  check_service(service, _local_scope);
                }
              }
            }
          };
          check_service(bin);
          return step(false, function() {
            return next();
          });
        });
        if (was_synchronous) {
          return null;
        } else {
          return next;
        }
      };
      if (reaction.certified == null) {
        reaction.certified = true;
      }
      if (this.defaults != null) {
        check.defaults(bin, this.defaults);
      }
      if (this.locks != null) {
        reaction.certified = check.locks((_ref = bin.__) != null ? (_ref1 = _ref.session) != null ? _ref1.keys : void 0 : void 0, this.locks);
      }
      if (this.values != null) {
        reaction.certified = check.values(bin, this.values);
      }
      if (reaction.certified && (this.steps != null)) {
        review_result = this.steps.call({
          bin: bin,
          document: this.document,
          'interface': this,
          actor: this.actor,
          reaction: reaction
        }, {
          bin: bin,
          document: this.document,
          'interface': this,
          actor: this.actor,
          reaction: reaction,
          next: check_services
        });
      }
      switch (review_result) {
        case check_services:
          return next;
        case void 0:
          return check_services();
        default:
          return null;
      }
    },
    submit: function(bin) {
      var publisher, reaction;
      if (bin == null) {
        bin = {};
      }
      publisher = new _.Publisher;
      reaction = new Interface.Reaction;
      _.serialize(this, function(step) {
        step(function(next) {
          var result;
          result = this.review(bin, {
            global: [],
            local: []
          }, reaction, next);
          if (result !== next) {
            return next();
          }
        });
        step(function(next) {
          var result;
          if (reaction.certified && (this.action != null)) {
            result = this.action.call({
              bin: bin,
              document: this.document,
              'interface': this,
              actor: this.actor,
              reaction: reaction
            }, {
              bin: bin,
              document: this.document,
              'interface': this,
              actor: this.actor,
              reaction: reaction,
              next: next
            });
          }
          if (!((reaction.bin != null) || result === next)) {
            reaction.bin = result;
          }
          if (result !== next) {
            return next();
          }
        });
        return step(false, function() {
          return publisher.notify(reaction);
        });
      });
      return publisher;
    },
    observe: function(action) {
      return new _.Observer((function(_this) {
        return function() {
          var _ref;
          if ((_ref = _this.document.signal) != null) {
            _ref.value();
          }
          return _this.submit().subscribe(function(_arg) {
            var bin;
            bin = _arg.bin;
            return action(bin.render());
          });
        };
      })(this));
    }
  });

  Interface.Reaction = _.prototype({
    constructor: function(bin, certified) {
      this.bin = bin;
      this.certified = certified;
    }
  });

  Interface.Web = _.prototype({
    inherit: Interface,
    use: function() {
      this.type = 'App';
      this.review = function(bin, scope, reaction, next) {
        _.serialize(this, function(step) {
          step(function(next) {
            var result;
            result = _["super"](Interface.Web.prototype.review, this, bin, scope, reaction, next);
            if (result !== next) {
              return next();
            }
          });
          return step(false, function() {
            var check_interfaces;
            reaction.bin = '';
            scope.local.length = 0;
            check_interfaces = function(bin) {
              var k, kups, local_kups, name, service, _i, _len, _ref, _ref1, _ref2, _ref3;
              for (name in bin) {
                service = bin[name];
                if (service instanceof Interface.Web) {
                  kups = reaction.kups != null ? reaction.kups : reaction.kups = {};
                  _ref = scope.global;
                  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    step = _ref[_i];
                    kups = kups[step] != null ? kups[step] : kups[step] = {};
                  }
                  local_kups = '';
                  if (scope.global.length > 0) {
                    local_kups = ((function() {
                      var _results;
                      _results = [];
                      for (k in kups) {
                        _results.push("" + k + " = " + (scope.global.join('.')) + "." + k);
                      }
                      return _results;
                    })()).join(', ');
                    if (local_kups !== "") {
                      local_kups = "\nvar " + local_kups + ";";
                    }
                  }
                  if (kups[name] == null) {
                    kups[name] = new Function('o', "var interface = this.interface, bin = this.bin, actor = this.actor, __hasProp = {}.hasOwnProperty;" + local_kups + "\nthis.interface = bin" + (scope.local.length > 0 ? '.' + scope.local.join('.') : '') + "." + name + ";\nthis.actor = this.interface != null ? this.interface.actor : null;\nthis.bin = this.interface != null ? (this.interface.bin != null ? this.interface.bin : {}) : {};\nif (o != null) {\n    for (k in o) {\n        if (hasOwnProperty.call(o, k)) {\n            this.bin[k] = o[k];\n        }\n    }\n}\n(" + (((_ref1 = (_ref2 = service.action) != null ? _ref2.overriden : void 0) != null ? _ref1 : service.action).toString()) + ").call(this);\nthis.bin = bin; this.interface = interface, this.actor = actor;");
                  }
                  if (((_ref3 = bin[name]) != null ? _ref3.bin : void 0) != null) {
                    check_interfaces(bin[name].bin);
                  }
                } else {
                  if (_.isBasicObject(service)) {
                    scope.global.push(name);
                    scope.local.push(name);
                    check_interfaces(service);
                    scope.local.pop();
                    scope.global.pop();
                  }
                }
              }
            };
            check_interfaces(bin);
            return next();
          });
        });
        return next;
      };
      return this.submit = function(bin) {
        var callback, chocokup_code, result, _ref, _ref1;
        if (!((_ref = this.action) != null ? _ref.overriden : void 0)) {
          chocokup_code = (_ref1 = this.action) != null ? _ref1 : function() {};
          this.action = (function(_this) {
            return function(_arg) {
              var bin, kups, options, reaction;
              bin = _arg.bin, reaction = _arg.reaction;
              if (bin == null) {
                bin = {};
              }
              kups = reaction.kups;
              delete reaction.kups;
              options = {
                bin: bin,
                document: _this.document,
                'interface': _this,
                actor: _this.actor,
                kups: kups
              };
              if (bin.theme != null) {
                options.theme = bin.theme;
              }
              if (bin.with_coffee != null) {
                options.with_coffee = bin.with_coffee;
              }
              if (bin.manifest != null) {
                options.manifest = bin.manifest;
              }
              return reaction.bin = (function() {
                var _ref2;
                switch (this.type) {
                  case 'Panel':
                    return new Chocokup.Panel(options, chocokup_code);
                  default:
                    return new Chocokup[this.type]((_ref2 = bin != null ? bin.name : void 0) != null ? _ref2 : '', options, chocokup_code);
                }
              }).call(_this);
            };
          })(this);
          this.action.overriden = chocokup_code;
        }
        if (typeof bin === 'function') {
          callback = bin;
          bin = {};
        }
        result = _["super"](this, bin);
        if (callback != null) {
          result.subscribe(function(reaction) {
            return callback(reaction.bin.render());
          });
        }
        return result;
      };
    }
  });

  Interface.Web.App = Interface.Web;

  Interface.Web.Document = _.prototype({
    inherit: Interface.Web,
    use: function() {
      return this.type = 'Document';
    }
  });

  Interface.Web.Panel = _.prototype({
    inherit: Interface.Web,
    use: function() {
      return this.type = 'Panel';
    }
  });

  _module = typeof window !== "undefined" && window !== null ? window : module;

  if (_module.exports != null) {
    _module.exports = Interface;
  } else {
    if (window.Locco == null) {
      window.Locco = {};
    }
    window.Locco.Interface = Interface;
  }

}).call(this);
