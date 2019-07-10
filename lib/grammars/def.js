/**
 * Def
 */

import { block } from '../grammar-rules'

class Def {
  constructor(marked) {
    this.options = marked.options

    this.rules = {
      block: block.def,
    }
  }

  tokenize(cap, src, tokens, tokenFunc, isTop) {
    if (!isTop) {
      return
    }

    let title = cap[3]
    if (title) {
      title = title.substring(1, title.length - 1);
    }

    const tag = cap[1].toLowerCase().replace(/\s+/g, ' ');

    if (!tokens.links[tag]) {
      tokens.links[tag] = { // eslint-disable-line
        href: cap[2],
        title,
      }
    }
  }

  parse() {
    return false
  }
}

export default Def
