/**
 * newline
 */

import { block } from '../grammar-rules'

class Newline {
  constructor(marked) {
    this.options = marked.options

    this.tokenTypes = ['space']

    this.rules = {
      block: block.newline,
    }
  }

  tokenize(cap, src, tokens) {
    if (cap[0].length > 1) {
      tokens.push({
        type: this.tokenTypes[0],
      });
    }
  }

  parse(token) {
    if (!this.tokenTypes.includes(token.type)) {
      return false
    }

    return ''
  }
}

export default Newline
