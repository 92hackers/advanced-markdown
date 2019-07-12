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
      type: this.tokenTypes[0],
      text: cap[0],
    })
  }

  parse(token, inline, inlineText, tokFunc, nextFunc, parseTextFunc) {
    if (!this.tokenTypes.includes(token.type)) {
      return false
    }

    const concattedText = parseTextFunc()
    return this.renderHtmlStr(concattedText)
  }

  renderHtmlStr(text) {
    return `<p>${text}</p>\n`
  }
}

export default Text
