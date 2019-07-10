import babel from 'rollup-plugin-babel'

export default {
  input: 'lib/LightSchema.js',
  output: {
    file: 'dist/LightSchema.js',
    format: 'cjs'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ]
}