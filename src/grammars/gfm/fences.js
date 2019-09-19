/**
 * GFM fences
 */

import Code from '../code'
import { block } from '../../grammar-rules'

class GfmFences extends Code {
  constructor(marked) {
    super(marked)

    this.rules = {
      block: block.gfm.fences,
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
