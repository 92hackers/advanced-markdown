/**
 * Heading, Titles...
 */

import {
  unescape,
} from '../utils'

import { block } from '../grammar-rules'

class Heading {
  constructor(marked) {
    this.options = marked.options
    this.marked = marked

    this.tokenTypes = ['heading']

    const gfmHeadingRule = block.gfm.heading
    const commonHeadingRule = block.heading

    const { gfm } = this.options
    this.rules = {
      block: gfm ? gfmHeadingRule : commonHeadingRule,
    }
  }

  // cap = rule.exec(src)
  tokenize(cap, src, tokens) {
    tokens.push({
      type: this.tokenTypes[0],
      depth: cap[1].length,
      text: cap[2],
    })
  }

  parse(token, inlineLexer, inlineTextLexer) {
    if (!this.tokenTypes.includes(token.type)) {
      return false
    }

    const { text, depth } = token
    const slugger = new this.marked.Slugger()

    return this.renderHtmlStr(
      inlineLexer.output(text),
      depth,
      unescape(inlineTextLexer.output(text)),
      slugger,
    )
  }

  renderHtmlStr(text, level, raw, slugger) {
    if (this.options.headerIds) {
      return '<h'
      + level
      + ' id="'
      + this.options.headerPrefix
      + slugger.slug(raw)
      + '">'
      + text
      + '</h'
      + level
      + '>\n';
    }

    // ignore IDs
    return '<h' + level + '>' + text + '</h' + level + '>\n';
  }
}

export default Heading
