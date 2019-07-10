import { errors, SchemaError } from './errors'

export const isDefined = x => x !== null && typeof x !== 'undefined'
export const is = (x, i) => x === i || (isDefined(x) && x.constructor === i) // || (isDefined(i) && x instanceof i)

export const check = (x, ...types) => {
  if (!types.some(type => is(x, type))) {
    const type = typeof x
    throw new SchemaError(errors.unexpectedType, { got: type })
  }
}

export const isCircular = target => {
  const map = new WeakMap()
  const detect = obj => {
    if (obj === null || typeof obj !== 'object') return false
    if (map.get(obj)) return true
    map.set(obj, true)
    return Object.values(obj).some(objProp => detect(objProp))
  }
  return detect(target)
}
