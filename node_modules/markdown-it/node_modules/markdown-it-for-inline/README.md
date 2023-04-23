# markdown-it-for-inline

[![Build Status](https://img.shields.io/travis/markdown-it/markdown-it-for-inline/master.svg?style=flat)](https://travis-ci.org/markdown-it/markdown-it-for-inline)
[![NPM version](https://img.shields.io/npm/v/markdown-it-for-inline.svg?style=flat)](https://www.npmjs.org/package/markdown-it-for-inline)
[![Coverage Status](https://img.shields.io/coveralls/markdown-it/markdown-it-for-inline/master.svg?style=flat)](https://coveralls.io/r/markdown-it/markdown-it-for-inline)

> Inline tokens iterator for [markdown-it](https://github.com/markdown-it/markdown-it) markdown parser.

This plugin allows to apply function to certain types of inline tokens. Speed
will be not fastest of possible, but you can do quick prototyping of certain
rule types.


## Usage

## Install

node.js, browser:

```bash
npm install markdown-it-for-inline --save
bower install markdown-it-for-inline --save
```

## Use

```js
var iterator = require('markdown-it-for-inline');

// plugin params are:
//
// - rule name (should be unique)
// - token type to apply
// - function
//
var md = require('markdown-it')()
            .use(iterator, 'foo_replace', 'text', function (tokens, idx) {
              tokens[idx].content = tokens[idx].content.replace(/foo/g, 'bar');
            });
```

_Differences in browser._ If you load script directly into the page, without
package system, module will add itself globally as `window.markdownitForInline`.


__Example 2.__ Cut link prefixes

```js
var iterator = require('markdown-it-for-inline');

var md = require('markdown-it')({ linkify: true })
            .use(iterator, 'url_beautify', 'link_open', function (tokens, idx) {
              // Make sure link contains only text
              if ((tokens[idx + 2].type !== 'link_close') ||
                  (tokens[idx + 1].type !== 'text')) {
                return;
              }
              // Do replacement
              tokens[idx + 1].content = tokens[idx + 1].content
                                          .replace(/^https?:\/\//, '')
                                          .replace(/^www./, '');
            });
```

__Example 3.__ Make links open in new window

```js
var iterator = require('markdown-it-for-inline');

var md = require('markdown-it')({ linkify: true })
            .use(iterator, 'url_new_win', 'link_open', function (tokens, idx) {
              tokens[idx].attrPush([ 'target', '_blank' ]);
            });
```


## License

[MIT](https://github.com/markdown-it/markdown-it-for-inline/blob/master/LICENSE)
