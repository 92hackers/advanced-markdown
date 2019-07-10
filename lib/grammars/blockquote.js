/**
 * blockquote
 */
import { block } from '../grammar-rules'

class Blockquote {
  constructor(marked) {
    this.options = marked.options

    this.tokenTypes = ['blockquote_start', 'blockquote_end']

    this.rules = {
      block: block.blockquote,
    }
  }

  tokenize(cap, src, tokens, tokenFunc, isTop) {
    tokens.push({
      type: this.tokenTypes[0],
    });

    const matchStr = cap[0]
    const newCap = matchStr.replace(/^ *> ?/gm, '');

    // Pass `top` to keep the current
    // "toplevel" state. This is exactly
    // how markdown.pl works.
    tokenFunc(newCap, isTop);

    tokens.push({
      type: this.tokenTypes[1],
    })
  }

  parse(token, inline, inlineText, tokFunc, nextFunc) {
    if (this.tokenTypes[0] !== token.type) {
      return false
    }

    let body = ''

    while (nextFunc().type !== this.tokenTypes[1]) {
      body += tokFunc()
    }

    return this.renderHtmlStr(body)
  }

  renderHtmlStr(quote) {
    return `<blockquote>\n${quote}</blockquote>\n`
  }
}

export default Blockquote
