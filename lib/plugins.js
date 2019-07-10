import { check, isDefined } from './utils'

const defaultTypes = [ String, Boolean, Array, Number, Date, Object ]
const _types = {}
const _props = {}
const _validate = {}
const _preProcessed = { types: [], props: [], valid: [] }

const mergeProps = () => {
  const mergedProps = {}
  Object.values(_props).forEach(pluginProps => Object.assign(mergedProps, pluginProps))
  const allProps = []
  Object.keys(mergedProps).forEach(propKey => {
    const propValue = mergedProps[ propKey ]
    propValue.key = propKey
    allProps.push(propValue)
  })
  return allProps
}

export const Plugins = {
  registerPlugin ({ name, type, props, validate }) {
    check(name, String)
    if (isDefined(type)) {
      _types[ name ] = type
      _preProcessed.types = Object.values(_types).concat(defaultTypes)
    }
    if (isDefined(props)) {
      _props[ name ] = props
      _preProcessed.props = mergeProps()
    }
    if (typeof validate === 'function') {
      _validate[ name ] = validate
      _preProcessed.valid = Object.values(_validate)
    }
  },
  removePlugin ({ name }) {
    check(name, String)
    const plugin = {
      name: name,
      type: _types[ name ],
      props: _props[ name ],
      validate: _validate[ name ]
    }
    delete _types[ name ]
    delete _props[ name ]
    delete _validate[ name ]
    _preProcessed.props = mergeProps()
    _preProcessed.types = Object.values(_types)
    _preProcessed.valid = Object.values(_validate)
    return plugin
  },
  types (name) {
    return name ? _types[ name ] : _preProcessed.types
  },
  props (name) {
    return name ? _props[ name ] : _preProcessed.props
  },
  validators (name) {
    return name ? _validate[ name ] : _preProcessed.valid
  },
  clear () {
    const allPlugins = {}
    const remove = key => {
      const plugin = {
        name: key,
        type: _types[ key ],
        props: _props[ key ],
        validate: _validate[ key ]
      }
      delete _types[ key ]
      delete _props[ key ]
      delete _validate[ key ]
      allPlugins[ key ] = plugin
    }
    Object.keys(_types).forEach(remove)
    Object.keys(_props).forEach(remove)
    Object.keys(_validate).forEach(remove)
    _preProcessed.types = defaultTypes
    _preProcessed.props = []
    _preProcessed.valid = []
    return allPlugins
  }
}
