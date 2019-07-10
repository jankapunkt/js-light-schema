import { is, isDefined, isCircular } from './utils'
import { normalize } from './transform'
import { Plugins } from './plugins'
import { SchemaError, errors } from './errors'

/**
 * Lightweight Schema definition and validation, that accepts various plugin extensions.
 */
export default class LightSchema {
  /**
   * Static definitions of internally used error keys. Used for association and/or translation.
   * @returns {{unexpectedType, keyNotInSchema, validationFailed, keyRequired, circular, undefined}}
   */
  static get errors () { return errors }

  /**
   * Register a new plugin that affects the validation behavior. Overriding is possible by sequence (latest matters). A
   * plugin can use different combinations of type, props and validate. Since the plugin system is static, it is
   * possible to write packages that add internally add a certain plugin config to the LightSchema and allow others to
   * auto-add the plugin by importing the respective packages.
   * @param name {String} Access key of the the plugin. Can be a unique word or an id.
   * @param type {*} Allows to add a new type (for example ArrayBuffer) or custom classes.
   * @param props {Object} An Object with arbitrary property definitions. Names are the keys of the propertes. Each
   *   prop requires a {type}. An optional {default} can be defined.
   * @param validate {Function} a function to validate the current key/value pair in a validation context. Should
   *   return void/null if passed or an object with {key},{value} and additional information like the prop and a reason
   *   for failure.
   * @returns {*|void}
   */
  static registerPlugin ({ name, type, props, validate }) {
    return Plugins.registerPlugin({ name, type, props, validate })
  }

  /**
   * Removes a plugin configuration by a given name or clears all plugins.
   * @param name {String} Name or id of the plugin
   * @param all {Boolean}
   * @returns {Object} Either of both returns the plugin config in order to register it again (helpful if you lost the
   *   plugin context).
   */
  static removePlugin ({ name, all }) {
    if (all) {
      return Plugins.clear()
    }
    return Plugins.removePlugin({ name })
  }

  /**
   * Constructs a new LightSchema instance.
   * @param definition {Object} the definition object of the schema
   * @throws {SchemaError} If a circular structure is detected it throws an error.
   */
  constructor (definition) {
    if (isCircular(definition)) {
      throw new SchemaError(errors.circular)
    }
    this.definition = definition
    this.schema = normalize(definition)
  }

  /**
   * Returns the original schema definition, that has been used to construct this instance.
   * @returns {Object} the original Schema definition
   */
  get original () { return this.definition }

  /**
   * Returns a normalized version of the schema definition where each property is defined with the given values or
   * defined defaults, if only a type has been given.
   * @returns {Object} the normalzed version of the schema model
   */
  get model () { return this.schema }

  /**
   * Validates a given object / document against the schema.
   * @param input The document / object to be validated.
   * @returns {Array} Always returns an Array
   */
  validate (input) {
    if (!isDefined(input) || typeof input !== 'object' || Array.isArray(input) || Object.prototype.toString.call(input) === '[object Date]') {
      throw new SchemaError(errors.unexpectedType)
    }
    if (isCircular(input)) {
      throw new SchemaError(errors.circular)
    }

    const failures = []
    const schema = Object.assign({}, this.schema)

    const matchValueAgainstProps = (key, value, schemaObj) => {
      const { optional } = schemaObj
      if (optional && !isDefined(value)) {
        return
      }

      const { type } = schemaObj
      if (!is(value, type)) {
        failures.push({ key, value, expected: schemaObj.type, reason: errors.unexpectedType })
      }

      Plugins.validators().forEach(validator => {
        const failure = validator(key, value, schemaObj)
        if (failure) failures.push(failure)
      })
    }

    const traverse = (inputObj, schemaRoot) => {
      // we check for each key in input
      // so we can easily detect if there are
      // more props given than defined in the schema
      Object.keys(inputObj).forEach(inputKey => {
        // if key is not defined in schema
        const schemaProp = schemaRoot[ inputKey ]
        if (!schemaProp) {
          failures.push({ key: inputKey, reason: errors.keyNotInSchema })
          return
        }

        // check if value matches given type
        const value = inputObj[ inputKey ]
        const { type } = schemaProp
        matchValueAgainstProps(inputKey, value, schemaProp)

        // if we have an object or an array and we have no
        // given entries property
        if (type === Object || type === Array) {
          if (!value.entries) {
            failures.push({ key: inputKey, reason: errors.unexpectedType })
            return
          }
          traverse(value.entries, schemaProp.entries)
        }
        // we delete the key in the schema to see which keys
        // remain in the end, after all keys have been checked
        delete schemaRoot[ inputKey ]
      })
    }
    traverse(input, schema)
    Object.keys(schema).forEach(key => {
      failures.push({ key, reason: errors.keyRequired })
    })
    return failures
  }
}
