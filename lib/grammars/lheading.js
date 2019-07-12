/**
 * lheading
 *
 * Example:
 *
 * Title
 * ---------------------
 */

import { block } from '../grammar-rules'
import Heading from './heading'

class LHeading extends Heading {
  constructor(marked) {
    super(marked)

    this.rules = {
      block: block.lheading,
    }
  }

  tokenize(cap, src, tokens) {
    tokens.push({
      type: this.tokenTypes[0],
      depth: cap[2] === '=' ? 1 : 2,
      text: cap[1],
    })
  }
}

export default LHeading
