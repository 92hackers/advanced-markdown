/**
 * html
 */

import { block } from '../grammar-rules'

class Html {
  constructor(marked) {
    this.options = marked.options

    this.tokenTypes = ['html']

    this.rules = {
      block: block.html,
    }
  }

  tokenize(cap, src, tokens) {
    const { sanitizer } = this.options

    tokens.push({
      type: this.tokenTypes[0],
      pre: !sanitizer && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
      text: cap[0],
    })
  }

  parse(token) {
    if (!this.tokenTypes.includes(token.type)) {
      return false
    }

    return token.text
  }
}

export default Html
