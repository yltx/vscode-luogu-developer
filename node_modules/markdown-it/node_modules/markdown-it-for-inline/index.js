'use strict';


module.exports = function for_inline_plugin(md, ruleName, tokenType, iteartor) {

  function scan(state) {
    var i, blkIdx, inlineTokens;

    for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
      if (state.tokens[blkIdx].type !== 'inline') {
        continue;
      }

      inlineTokens = state.tokens[blkIdx].children;

      for (i = inlineTokens.length - 1; i >= 0; i--) {
        if (inlineTokens[i].type !== tokenType) {
          continue;
        }

        iteartor(inlineTokens, i);
      }
    }
  }

  md.core.ruler.push(ruleName, scan);
};
