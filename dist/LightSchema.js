'use strict';

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

var SchemaError = function (_Error) {
  _inherits(SchemaError, _Error);

  function SchemaError(message, details) {
    var _this;

    _classCallCheck(this, SchemaError);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SchemaError).call(this, message));
    _this.name = 'SchemaError';
    _this._details = details;
    return _this;
  }

  _createClass(SchemaError, [{
    key: "details",
    get: function get() {
      return this._details;
    }
  }]);

  return SchemaError;
}(_wrapNativeSuper(Error));
var errors = {
  validationFailed: 'validationFailed',
  unexpectedType: 'unexpectedType',
  keyNotInSchema: 'keyNotInSchema',
  keyRequired: 'keyRequired',
  circular: 'circular',
  undefined: 'undefined'
};

var isDefined = function isDefined(x) {
  return x !== null && typeof x !== 'undefined';
};
var is = function is(x, i) {
  return x === i || isDefined(x) && x.constructor === i;
};
var check = function check(x) {
  for (var _len = arguments.length, types = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    types[_key - 1] = arguments[_key];
  }

  if (!types.some(function (type) {
    return is(x, type);
  })) {
    var type = _typeof(x);

    throw new SchemaError(errors.unexpectedType, {
      got: type
    });
  }
};
var isCircular = function isCircular(target) {
  var map = new WeakMap();

  var detect = function detect(obj) {
    if (obj === null || _typeof(obj) !== 'object') return false;
    if (map.get(obj)) return true;
    map.set(obj, true);
    return Object.values(obj).some(function (objProp) {
      return detect(objProp);
    });
  };

  return detect(target);
};

var defaultTypes = [String, Boolean, Array, Number, Date, Object];
var _types = {};
var _props = {};
var _validate = {};
var _preProcessed = {
  types: [],
  props: [],
  valid: []
};

var mergeProps = function mergeProps() {
  var mergedProps = {};
  Object.values(_props).forEach(function (pluginProps) {
    return Object.assign(mergedProps, pluginProps);
  });
  var allProps = [];
  Object.keys(mergedProps).forEach(function (propKey) {
    var propValue = mergedProps[propKey];
    propValue.key = propKey;
    allProps.push(propValue);
  });
  return allProps;
};

var Plugins = {
  registerPlugin: function registerPlugin(_ref) {
    var name = _ref.name,
        type = _ref.type,
        props = _ref.props,
        validate = _ref.validate;
    check(name, String);

    if (isDefined(type)) {
      _types[name] = type;
      _preProcessed.types = Object.values(_types).concat(defaultTypes);
    }

    if (isDefined(props)) {
      _props[name] = props;
      _preProcessed.props = mergeProps();
    }

    if (typeof validate === 'function') {
      _validate[name] = validate;
      _preProcessed.valid = Object.values(_validate);
    }
  },
  removePlugin: function removePlugin(_ref2) {
    var name = _ref2.name;
    check(name, String);
    var plugin = {
      name: name,
      type: _types[name],
      props: _props[name],
      validate: _validate[name]
    };
    delete _types[name];
    delete _props[name];
    delete _validate[name];
    _preProcessed.props = mergeProps();
    _preProcessed.types = Object.values(_types);
    _preProcessed.valid = Object.values(_validate);
    return plugin;
  },
  types: function types(name) {
    return name ? _types[name] : _preProcessed.types;
  },
  props: function props(name) {
    return name ? _props[name] : _preProcessed.props;
  },
  validators: function validators(name) {
    return name ? _validate[name] : _preProcessed.valid;
  },
  clear: function clear() {
    var allPlugins = {};

    var remove = function remove(key) {
      var plugin = {
        name: key,
        type: _types[key],
        props: _props[key],
        validate: _validate[key]
      };
      delete _types[key];
      delete _props[key];
      delete _validate[key];
      allPlugins[key] = plugin;
    };

    Object.keys(_types).forEach(remove);
    Object.keys(_props).forEach(remove);
    Object.keys(_validate).forEach(remove);
    _preProcessed.types = defaultTypes;
    _preProcessed.props = [];
    _preProcessed.valid = [];
    return allPlugins;
  }
};

var transform = function transform(key, value) {
  check(key, String);
  check(value, Function, Object);
  var model = {};

  if (typeof value !== 'function') {
    check.apply(void 0, [value.type].concat(_toConsumableArray(Plugins.types())));
    check(value["boolean"], void 0, Boolean, Function);
    check(value.entries, void 0, Object);
    model.type = value.type;
    model.optional = value.optional || false;
    Plugins.props().forEach(function (prop) {
      var valueProp = value[prop.key];
      check(valueProp, void 0, prop.type);
      model[prop.key] = valueProp || prop["default"];
    });
  } else {
    model.type = value;
    model.optional = false;
    Plugins.props().forEach(function (prop) {
      model[prop.key] = prop["default"];
    });
  }

  return model;
};
var normalize = function normalize(obj) {
  var normalized = {};
  Object.keys(obj).forEach(function (currentKey) {
    var currentValue = obj[currentKey];
    var transformedValue = transform(currentKey, currentValue);

    if (transformedValue.type === Object || transformedValue.type === Array) {
      transformedValue.entries = normalize(transformedValue.entries);
    }

    normalized[currentKey] = transformedValue;
  });
  return normalized;
};

var LightSchema = function () {
  _createClass(LightSchema, null, [{
    key: "registerPlugin",
    value: function registerPlugin(_ref) {
      var name = _ref.name,
          type = _ref.type,
          props = _ref.props,
          validate = _ref.validate;
      return Plugins.registerPlugin({
        name: name,
        type: type,
        props: props,
        validate: validate
      });
    }
  }, {
    key: "removePlugin",
    value: function removePlugin(_ref2) {
      var name = _ref2.name,
          all = _ref2.all;

      if (all) {
        return Plugins.clear();
      }

      return Plugins.removePlugin({
        name: name
      });
    }
  }, {
    key: "errors",
    get: function get() {
      return errors;
    }
  }]);

  function LightSchema(definition) {
    _classCallCheck(this, LightSchema);

    if (isCircular(definition)) {
      throw new SchemaError(errors.circular);
    }

    this.definition = definition;
    this.schema = normalize(definition);
  }

  _createClass(LightSchema, [{
    key: "validate",
    value: function validate(input) {
      if (!isDefined(input) || _typeof(input) !== 'object' || Array.isArray(input) || Object.prototype.toString.call(input) === '[object Date]') {
        throw new SchemaError(errors.unexpectedType);
      }

      if (isCircular(input)) {
        throw new SchemaError(errors.circular);
      }

      var failures = [];
      var schema = Object.assign({}, this.schema);

      var matchValueAgainstProps = function matchValueAgainstProps(key, value, schemaObj) {
        var optional = schemaObj.optional;

        if (optional && !isDefined(value)) {
          return;
        }

        var type = schemaObj.type;

        if (!is(value, type)) {
          failures.push({
            key: key,
            value: value,
            expected: schemaObj.type,
            reason: errors.unexpectedType
          });
        }

        Plugins.validators().forEach(function (validator) {
          var failure = validator(key, value, schemaObj);
          if (failure) failures.push(failure);
        });
      };

      var traverse = function traverse(inputObj, schemaRoot) {
        Object.keys(inputObj).forEach(function (inputKey) {
          var schemaProp = schemaRoot[inputKey];

          if (!schemaProp) {
            failures.push({
              key: inputKey,
              reason: errors.keyNotInSchema
            });
            return;
          }

          var value = inputObj[inputKey];
          var type = schemaProp.type;
          matchValueAgainstProps(inputKey, value, schemaProp);

          if (type === Object || type === Array) {
            if (!value.entries) {
              failures.push({
                key: inputKey,
                reason: errors.unexpectedType
              });
              return;
            }

            traverse(value.entries, schemaProp.entries);
          }

          delete schemaRoot[inputKey];
        });
      };

      traverse(input, schema);
      Object.keys(schema).forEach(function (key) {
        failures.push({
          key: key,
          reason: errors.keyRequired
        });
      });
      return failures;
    }
  }, {
    key: "original",
    get: function get() {
      return this.definition;
    }
  }, {
    key: "model",
    get: function get() {
      return this.schema;
    }
  }]);

  return LightSchema;
}();

module.exports = LightSchema;
