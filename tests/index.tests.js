/* eslint-env mocha */
import { assert } from 'chai'
import LightSchema from '../lib/LightSchema'
import { is } from '../lib/utils'
import { errors } from '../lib/errors'

const create = (...args) => new LightSchema(...args)

describe('LightSchema', function () {
  describe('errors', function () {
    it('has error label keys defined', function () {
      const values = Object.values(LightSchema.errors)
      assert.isAbove(values.length, 0)
    })
  })

  describe('construction', function () {
    it('is instantiated via constructor', function () {
      const schema = new LightSchema({})
      assert.isDefined(schema)
      assert.isTrue(is(schema, LightSchema))
    })

    it('is instantiated via factory function', function () {
      const schema = create({})
      assert.isDefined(schema)
      assert.isTrue(is(schema, LightSchema))
    })

    it('throws on empty schema parameters', function () {
      assert.throws(function () {
        return new LightSchema()
      }, LightSchema.errors.undefined)
      assert.throws(function () {
        create()
      }, LightSchema.errors.undefined)
    })

    it('throws on circular structures', function () {
      const circ = {
        test: {
          id: String
        }
      }
      circ.test.ref = circ

      assert.throws(function () {
        return create(circ)
      }, LightSchema.errors.circular)
    })
  })

  describe('model', function () {
    it('generates a normalized model from a shorthand input', function () {
      const original = { test: String }
      const expected = {
        test: {
          type: String,
          optional: false
        }
      }

      const schema = create(original)
      assert.deepEqual(schema.model, expected)
      assert.notDeepEqual(schema.model, original)
    })

    it('keeps a reference to the original model', function () {
      const original = { test: String }
      const expected = {
        test: {
          type: String,
          optional: false
        }
      }

      const schema = create(original)
      assert.notDeepEqual(schema.original, expected)
      assert.deepEqual(schema.original, original)
    })
  })

  describe('validation', function () {
    const assertFailure = (schema, input) => {
      assert.throws(function () {
        schema.validate(input)
      })
    }

    it('returns failures if document is not an Object', function () {
      const schema = create({ title: String })
      const date = new Date()

      class ExtendedDate extends Date {
        get title () { return 'this is a date' }
      }

      const extendedDate = new ExtendedDate()

      assertFailure(schema, void 0)
      assertFailure(schema, null)
      assertFailure(schema, 1)
      assertFailure(schema, [])
      assertFailure(schema, [ 'test' ])
      assertFailure(schema, '')
      assertFailure(schema, 'test')
      assertFailure(schema, () => {})
      assertFailure(schema, date)
      assertFailure(schema, extendedDate)
    })

    it('throws if the document is circular', function () {
      const schema = create({ title: String })
      const circ = {}
      circ.title = circ

      assert.throws(function () {
        schema.validate(circ)
      }, LightSchema.errors.circular)
    })

    it('throws if a child in the document is circular', function () {
      const schema = create({ title: String })
      const circ = {
        entries: {
          foo: 'bar'
        }
      }
      circ.title = 'the title'
      circ.entries.ref = circ.entries

      assert.throws(function () {
        schema.validate(circ)
      }, LightSchema.errors.circular)
    })

    it('returns an empty array on a valid object', function () {
      const schema = create({ title: String })
      const failures = schema.validate({ title: 'The title' })
      assert.equal(failures.length, 0)
    })

    it('returns an empty array on a valid class instance', function () {
      function Class (title) {
        this.title = title
      }

      const instance = new Class('The title')
      const schema = create({ title: String })
      const failures = schema.validate(instance)
      assert.equal(failures.length, 0)
    })

    it('returns an array with n failures for n invalid matches', function () {
      const schema = create({ title: String, age: Number })
      const failures = schema.validate({ age: 'The title', title: 42 })
      assert.equal(failures.length, 2)
    })

    it('failures reference to the key and value and state a reason', function () {
      const schema = create({ title: String, age: Number })
      const failures = schema.validate({ age: 'The title', title: 'The title' })
      const fail = failures[ 0 ]

      assert.equal(fail.key, 'age')
      assert.equal(fail.value, 'The title')
    })

    it('failures objects that are missing non-optional schema keys', function () {
      const schema = create({ title: String, age: Number })
      const failures = schema.validate({ title: 'The title' })
      const fail = failures[ 0 ]

      assert.isDefined(fail)
      assert.equal(fail.key, 'age')
      assert.equal(fail.value, void 0)
    })
  })

  describe('plugins', function () {
    afterEach(function () {
      LightSchema.removePlugin({ all: true })
    })

    it('allows to add new types', function () {
      LightSchema.registerPlugin({
        name: 'bufferTypes',
        type: ArrayBuffer
      })

      const bufferSchema = create({
        file: ArrayBuffer
      })
      assert.isDefined(bufferSchema)
      assert.equal(bufferSchema.model.file.type, ArrayBuffer)
    })

    it('allows to add new props', function () {
      LightSchema.registerPlugin({
        name: 'min',
        props: {
          min: {
            type: Number,
            default: -100
          }
        }
      })
      LightSchema.registerPlugin({
        name: 'max',
        props: {
          max: {
            type: Number,
            default: 100
          }
        }
      })

      const minMaxSchema = create({
        title: {
          type: String,
          min: 1,
          max: 10
        }
      })

      const model = minMaxSchema.model
      assert.equal(model.title.min, 1)
      assert.isDefined(model.title.max, 10)
    })

    it('throws on false types on custom props', function () {
      LightSchema.registerPlugin({
        name: 'min',
        props: {
          min: {
            type: Number,
            default: -100
          }
        }
      })

      assert.throws(function () {
        create({
          title: {
            type: String,
            min: '100'
          }
        })
      })
    })

    it('allows to use defaults on custom props', function () {
      LightSchema.registerPlugin({
        name: 'min',
        props: {
          min: {
            type: Number,
            default: -100
          }
        }
      })
      LightSchema.registerPlugin({
        name: 'max',
        props: {
          max: {
            type: Number,
          }
        }
      })

      const minMaxSchema = create({
        title: {
          type: String
        }
      })

      const model = minMaxSchema.model
      assert.equal(model.title.min, -100)
      assert.isUndefined(model.title.max)
    })

    it('allows to execute validation using the plugin', function () {
      LightSchema.registerPlugin({
        name: 'minMax',
        props: {
          min: {
            type: Number,
            default: -100
          },
          max: {
            type: Number,
            default: 100
          }
        },
        validate (key, value, { min, max }) {
          let target
          switch (Object.prototype.toString.call(value)) {
            case '[object String]':
            case '[object Array]':
              target = value.length
              break
            case '[object Number]':
              target = value
              break
            default:
              throw new Error('unexpected undefined type')
          }
          if (typeof min === 'number' && target < min) return { key, value, min, reason: 'valueTooSmall' }
          if (typeof max === 'number' && target > max) return { key, value, max, reason: 'valueTooLarge' }
        }
      })

      const minMaxSchema = create({
        title: {
          type: String,
          min: 1,
          max: 10
        }
      })
      const failures = minMaxSchema.validate({ title: 'The title' })
      assert.equal(failures.length, 0)
      const minFailures = minMaxSchema.validate({ title: '' })
      assert.equal(minFailures.length, 1)
      const maxFailures = minMaxSchema.validate({ title: 'The title too long' })
      assert.equal(maxFailures.length, 1)

      const minMaxSchemaNumber = create({
        age: {
          type: Number,
          min: 1,
          max: 10
        }
      })
      assert.equal(minMaxSchemaNumber.validate({ age: -1 }).length, 1)
      assert.equal(minMaxSchemaNumber.validate({ age: 0 }).length, 1)
      assert.equal(minMaxSchemaNumber.validate({ age: 1 }).length, 0)
      assert.equal(minMaxSchemaNumber.validate({ age: 9 }).length, 0)
      assert.equal(minMaxSchemaNumber.validate({ age: 10 }).length, 0)
      assert.equal(minMaxSchemaNumber.validate({ age: 11 }).length, 1)
    })
  })
})
