/**
 * Block Lexer
 */

import {
  block,
} from './grammar-rules'

import {
  getDefaultOptions,
} from './utils'

class Lexer {
  constructor(options) {
    this.tokens = [];
    this.tokens.links = Object.create(null);

    this.options = options || getDefaultOptions()

    // Passed in grammars
    this.grammars = this.options.grammars
  }

  // Expose Block Rules
  static rules = block

  // Static Lex Method
  static lex = (src, options) => {
    const lexer = new Lexer(options);
    return lexer.lex(src);
  }

  lex(src) {
    const srcStr = src
      .replace(/\r\n|\r/g, '\n')
      .replace(/\t/g, '    ')
      .replace(/\u00a0/g, ' ')
      .replace(/\u2424/g, '\n');

    return this.token(srcStr, true);
  }

  // Lexing, tokenize the source markdown string
  token(srcStr, top) {
    let src = srcStr.replace(/^ +$/gm, '');

    while (src) {
      let isStrMatched = false

      this.grammars.some((grammar) => {
        const cap = grammar.rules.block.exec(src)
        if (!cap) {
          return false
        }

        const subStr = grammar.tokenize(cap, src, this.tokens, this.token.bind(this), top)
        if (subStr === -1) {
          return false
        }

        src = subStr || src.substring(cap[0].length);
        isStrMatched = true

        return true
      })

      if (!isStrMatched && src) {
        throw new Error(`Infinite loop on byte: ${src.charCodeAt(0)}`)
      }
    }

    return this.tokens
  }
}

export default Lexer
