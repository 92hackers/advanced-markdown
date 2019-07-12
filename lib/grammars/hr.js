/**
 * hr
 */

import { block } from '../grammar-rules'

class Hr {
  constructor(marked) {
    this.options = marked.options

    this.tokenTypes = ['hr']

    this.rules = {
      block: block.hr,
    }
  }

  tokenize(cap, src, tokens) {
    tokens.push({
      type: this.tokenTypes[0],
    });
  }

  parse(token) {
    if (!this.tokenTypes.includes(token.type)) {
      return false
    }

    return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
  }
}

export default Hr
