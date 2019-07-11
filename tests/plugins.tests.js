/* eslint-env mocha */
import { assert } from 'chai'
import { Plugins } from '../lib/plugins'

describe('plugins', function () {
  describe('default states', function () {
    it('has a default of types defined', function () {
      const types = Plugins.types()
      assert.isAbove(types.indexOf(Number), -1)
      assert.isAbove(types.indexOf(String), -1)
      assert.isAbove(types.indexOf(Object), -1)
      assert.isAbove(types.indexOf(Array), -1)
      assert.isAbove(types.indexOf(Boolean), -1)
      assert.isAbove(types.indexOf(Date), -1)

      assert.equal(types.indexOf(Function), -1)
    })
  })
})