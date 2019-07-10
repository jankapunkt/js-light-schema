# LightSchema
Lightweight and pluggable schema validator. As minimum opinionated as possible.

[![Project Status: Active – The project has reached a stable, usable state and is being actively developed.](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)
[![Build Status](https://travis-ci.org/jankapunkt/js-light-schema.svg?branch=master)](https://travis-ci.org/jankapunkt/js-light-schema)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
![npm bundle size](https://img.shields.io/bundlephobia/min/lightschema.svg)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/lightschema.svg)

## Getting started

```bash
$ npm install --save lightschema
```

Then in your code import and instantiate it:

```javascript
import LightSchema from 'lightschema'

const createSchema = (definition) => new LightSchema(definition)
const schema = createSchema({
  title: String,  // shorthand definition
  age: {          // detailed definition
    type: Number,
    optional: true
  }
})

schema.validate({ title: 'the title' }) // returns [], means no errors found
schema.validate({}) // returns [ { key: 'title', value: undefined, reason: 'keyRequired' }], means one error found
```

## Internal normalization

When creating a schema, the definition model is internally normalized, if shorthands were used. Consider the following example:

````javascript
{
  title: String,
  complexObject: {
    type: Object,
    entries: {
      name: String,
      value: Number
    }
  },
  optional: {
    type: String,
    optional: true
  },
  arrayObject: {
    type: Array,
    entries: {
      name: String,
      id: String
    }
  }
}
````

which will be transformed to

```javascript
{
  title: {
    type: String,
    optional: false
  },
  complexObject: {
    type: Object,
    optional: false
    entries: {
      name: {
        type: String,
        optional: false
      },
      value: {
        type: Number,
        optional: false
      }
    }
  },
  optional: {
    type: String,
    optional: true
  },
  arrayObject: {
    type: Array,
    optional: false
    entries: {
      name: {
        type: String,
        optional: false
      },
      id: {
        type: Number,
        optional: false
      }
    }
  }
}
```

**Access the normalzed and original models** 

This normalized model can be accessed via `schemaInstance.model` whereas the original definition is available via `schemaInstance.original`.

## Circular references

Any definition or validation input that contains a circular reference will be denied by a thrown error. If you want to reuse schema pattern you may write a small factory and use `Object.assign`.

## Use plugins

The library comes with a default checking for the `type` property with the builtin types `undefined, null, Number, String, Boolean, Array, Object, Date` and the `optional` property to define keys that can be omitted.
To extend the range of types and/or properties or to add custom validation you can statically register plugins on the `LightSchema` class.

### Register Props

The following example registers a plugin for allowing labels:

```javascript
LightSchema.registerPlugin({
  name: 'labels',
  props: {
    label: {
      type: String
    }
  }
})
```

now you can define `label` props on any key:

 ```javascript
 import LightSchema from 'lightschema'
 
 const createSchema = (definition) => new LightSchema(definition)
 const schema = createSchema({
   title: {
     type: String,
     label: 'The title'
   },
 })
 
 schema.validate({ title: 'the title' }) // returns [], means no errors found
 ```
 
this does not alter the validation behavior at all, but your model has now more static information.
Now let's register a prop that affects validation.

### Register props and validators

Let's say we want to have min/max values to be checked on all Strings, Numbers, Arrays, we can define this plugin like the following:

```javascript
LightSchema.registerPlugin({
  name: 'minMax',
  props: {
    min: {
	  type: Number,
	  default: -100 // defaults are possible but be careful as they apply as fallback on all keys and could break validation
    },
    max: {
	  type: Number
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
    // return nothing / void / null if your validator passed
  }
})
```

Now let's try this plugin with some basic schema:

```javascript
const minMaxSchema = create({
title: {
  type: String,
  min: 1, // your actual min value for this key
  max: 10
}
})
minMaxSchema.validate({ title: 'The title' }) // []
minMaxSchema.validate({ title: '' }) // [{ key: 'title', value: '', min: 1, reason: 'valueTooSmall' }]
minMaxSchema.validate({ title: 'The title too long' }) // [{ key: 'title', value: '', min: 1, reason: 'valueTooLarge' }]
```

### Register types

You can also register the range of types, that are allowed to be defined by the schema. Let's add an `ArrayBuffer` type:

```javascript
LightSchema.registerPlugin({
  name: 'bufferTypes',
  type: ArrayBuffer
})

const bufferSchema = create({
  file: ArrayBuffer
})

bufferSchema.validate({ file: new ArrayBuffer(8) }) // [] 
```

## Remove plugins

Plugins can be removed. The are returned in case you already lost the plugin context:

````javascript
LightSchema.registerPlugin({
  name: 'bufferTypes',
  type: ArrayBuffer
})

const removed = LightSchema.removePlugin({ name: 'bufferTypes' })
console.log(removed) // { name: 'bufferTypes', type: [object ArrayBuffer] }
````

## Contribution, testing, coverage, rollup

Code of conduct = be nice, don't add too much new stuff, keep it short and simple.

Testing is done using mocha via

```bash
$ npm run test
```

Coverage is done using

```bash
$ npm run test-coverage
```

Rollup is used to bundle the files into one file in the `dist` folder.

## License

MIT, see license file