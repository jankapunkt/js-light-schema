import { check } from './utils'
import { Plugins } from './plugins'

export const transform = (key, value) => {
  check(key, String)
  check(value, Function, Object)
  const model = {}
  if (typeof value !== 'function') {
    check(value.type, ...Plugins.types())
    check(value.boolean, void 0, Boolean, Function)
    check(value.entries, void 0, Object)
    model.type = value.type
    model.optional = value.optional || false
    Plugins.props().forEach(prop => {
      const valueProp = value[ prop.key ]
      check(valueProp, void 0, prop.type)
      model[ prop.key ] = valueProp || prop.default
    })
  } else {
    model.type = value
    model.optional = false
    Plugins.props().forEach(prop => {
      model[ prop.key ] = prop.default
    })
  }
  return model
}

export const normalize = (obj) => {
  const normalized = {}
  Object.keys(obj).forEach(currentKey => {
    const currentValue = obj[ currentKey ]
    const transformedValue = transform(currentKey, currentValue)
    if (transformedValue.type === Object || transformedValue.type === Array) {
      transformedValue.entries = normalize(transformedValue.entries)
    }
    normalized[ currentKey ] = transformedValue
  })
  return normalized
}
