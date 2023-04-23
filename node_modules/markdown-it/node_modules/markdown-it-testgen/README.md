# markdown-it-testgen

[![Build Status](https://img.shields.io/travis/markdown-it/markdown-it-testgen/master.svg?style=flat)](https://travis-ci.org/markdown-it/markdown-it-testgen)
[![NPM version](https://img.shields.io/npm/v/markdown-it-testgen.svg?style=flat)](https://www.npmjs.org/package/markdown-it-testgen)


> This package parses fixtures in commonmark spec format and generates tests for
[markdown-it](https://github.com/markdown-it/markdown-it) parser and
[plugins](https://www.npmjs.org/browse/keyword/markdown-it-plugin).


```bash
npm install markdown-it-testgen
```


## Fixture format

Each fixture can have optional metadata in yaml format:

```yaml
---
desc: Batch description # file name used if not exists.
skip: true              # mark batch as pending
---
```

Then tests should follow in this format:

```
optional header
.
source
data
.
parsed
data
.


header2
.
src
.
result
.
```

If header missed - line number will be used instead.


## API

### module.exports(path, options, md)

- __path__ - file or directory name
- __options__ (not mandatory)
  - __header__ - Default `false`. Set `true` to use heaters for test names
  - __sep__ - array of allowed separators for samples, [ '.' ] by default
  - __assert__ - custom assertion package, `require('chai').assert` by default.
- __md__ - `markdown-it` instance to parse and compare samples

### module.exports.load(path, options, iterator)

For each loaded file - parse and pass data to iterator functions. Currently used for tests only.


## License

[MIT](https://github.com/markdown-it/markdown-it-testgen/blob/master/LICENSE)

