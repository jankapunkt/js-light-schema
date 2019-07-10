/* eslint-env mocha */
import { assert } from 'chai'
import { is, check, isCircular, isDefined } from '../lib/utils'

class ExtendedDate extends Date {
  get title () { return 'this is a date' }
}

describe('utils', function () {
  describe('is', function () {
    it('correctly detects types as they are', function () {
      assert.isTrue(is(void 0, void 0))
      assert.isTrue(is(1, Number))
      assert.isTrue(is('1', String))
      assert.isTrue(is('', String))
      assert.isTrue(is(true, Boolean))
      assert.isTrue(is(false, Boolean))
      assert.isTrue(is([], Array))
      assert.isTrue(is({}, Object))
      assert.isTrue(is(() => {}, Function))
      assert.isTrue(is(new Date(), Date))
      assert.isTrue(is(new ExtendedDate(), ExtendedDate))
      assert.isTrue(is(null, null))
    })

    it('correctly detects types as they are not', function () {
      assert.isFalse(is(void 0, null))
      assert.isFalse(is(null, void 0))
      assert.isFalse(is(1 && 1, Boolean))
      assert.isFalse(is('1', Number))
      assert.isFalse(is(null, Object))
      assert.isFalse(is([], Object))
      assert.isFalse(is(new Date(), Object))
      assert.isFalse(is(new ExtendedDate(), Date))
    })
  })

  describe('isDefined', function () {
    it('correctly detecs defined', function () {
      assert.isTrue(isDefined(1))
      assert.isTrue(isDefined(0))
      assert.isTrue(isDefined('1'))
      assert.isTrue(isDefined(''))
      assert.isTrue(isDefined(() => {}))
      assert.isTrue(isDefined([]))
      assert.isTrue(isDefined({}))
      assert.isTrue(isDefined(new Date()))
    })

    it('correctly detects undefined', function () {
      assert.isFalse(isDefined(null))
      assert.isFalse(isDefined(undefined))
      assert.isFalse(isDefined(void 0))
    })
  })

  describe('check', function () {
    it('throws if given input is not in the list of allowed types', function () {
      assert.throws(function () {
        check(void 0, String, Array, Object)
      })
    })

    it('does not throw if the input matches one of the allowed types', function () {
      check({}, String, Number, Object)
    })
  })

  describe('isCircular', function () {
    it('detects circular structures', function () {
      const circular = {
        internalRef: {},
        otherRef: []
      }
      circular.internalRef.ref = circular
      assert.isTrue(isCircular(circular))

      const circular2 = {
        internalRef: {},
        otherRef: []
      }
      circular2.otherRef.push(circular2)
      assert.isTrue(isCircular(circular2))

      const circular3 = {
        internalRef: {}
      }
      circular3.internalRef.arr = [ { ref: circular3 } ]
      assert.isTrue(isCircular(circular3))
    })
  })
  
  it ('detects normal structures as non-circular', function () {
    
  })
})
