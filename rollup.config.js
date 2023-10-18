const resolve = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const json = require('@rollup/plugin-json')
const terser = require('@rollup/plugin-terser')
const typescript = require('@rollup/plugin-typescript')

module.exports = {
  input: './src/extension.ts',
  output: {
    file: './dist/extension.js',
    format: 'cjs',
    sourcemap: true
  },
  external: ["vscode"],
  plugins: [
    resolve({
      preferBuiltins: true,
    }),
    commonjs(),
    json(),
    typescript(),
    terser()
  ]
}
