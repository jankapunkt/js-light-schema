/**
 * Extends Error class with an additional {details} field
 * @type {SchemaError}
 */
export const SchemaError = class SchemaError extends Error {
  constructor (message, details) {
    super(message)
    this.name = 'SchemaError'
    this._details = details
  }

  get details () { return this._details }
}

/**
 * @private
 */
export const errors = {
  validationFailed: 'validationFailed',
  unexpectedType: 'unexpectedType',
  keyNotInSchema: 'keyNotInSchema',
  keyRequired: 'keyRequired',
  circular: 'circular',
  undefined: 'undefined'
}
