
### Internal normalization

COnsider following example

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
    optional: false,
    label: 'title'
  },
  complexObject: {
    type: Object,
    optional: false,
    label: 'complexObject',
    entries: {
      name: {
        type: String,
        optional: false,
        label: 'name'
      },
      value: {
        type: Number,
        optional: false,
        label: 'value'
      }
    }
  },
  optional: {
    type: String,
    optional: true,
    label: 'optional'
  },
  arrayObject: {
    type: Array,
    optional: false,
    label: 'arrayObject'
    entries: {
      name: {
        type: String,
        optional: false,
        label: 'name'
      },
      id: {
        type: Number,
        optional: false,
        label: 'id'
      }
    }
  }
}
```