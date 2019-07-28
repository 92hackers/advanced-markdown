/**
 * Block Lexer
 */

import {
  block,
} from './grammar-rules'

class Lexer {
  constructor(markdown) {
    this.tokens = [];
    this.tokens.links = Object.create(null);

    // Passed in block grammars
    this.blockGrammars = markdown.blockGrammars

    if (!this.blockGrammars.length) {
      throw new Error('Grammars size is zero, at least one grammar required')
    }
  }

  // Expose Block Rules
  static rules = block

  // Static Lex Method
  static lex = (src, markdown) => {
    const lexer = new Lexer(markdown)
    return lexer.lex(src)
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

      this.blockGrammars.some((grammar) => { // eslint-disable-line no-loop-func
        const cap = grammar.rules.block.exec(src)
        if (!cap) {
          return false
        }

        const subStr = grammar.tokenize(cap, src, this.tokens, this.token.bind(this), top)
        if (subStr === -1) {
          return false
        }

        src = subStr || src.substring(cap[0].length)
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
