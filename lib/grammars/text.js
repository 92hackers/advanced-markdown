/**
 * Text
 */

import { block } from '../grammar-rules'

class Text {
  constructor(marked) {
    this.options = marked.options

    this.tokenTypes = ['text']
    this.rules = {
      block: block.text,
    }
  }

  tokenize(cap, src, tokens) {
    tokens.push({
      type: 'text',
      text: cap[0],
    })
  }

  parse(token, inline) {
    if (!this.tokenTypes.includes(token.type)) {
      return false
    }

    let { text } = token
    text = inline.output(text)
    return this.renderHtmlStr(text)
  }

  renderHtmlStr(text) {
    return `<p>${text}</p>\n`
  }
}

export default Text
