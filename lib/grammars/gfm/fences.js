/**
 * GFM fences
 */

import Code from '../code'

class GfmFences extends Code {
  constructor(marked) {
    super(marked)

    this.rules = {
      block: /^ {0,3}(`{3,}|~{3,})([^`\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,
    }
  }

  tokenize(cap, src, tokens) {
    tokens.push({
      type: this.tokenTypes[0],
      lang: cap[2] ? cap[2].trim() : cap[2],
      text: cap[3] || '',
    })
  }
}

export default GfmFences
