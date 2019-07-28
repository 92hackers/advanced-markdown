/**
 * Parser
 */

import InlineLexer from './inlineLexer'
import TextRenderer from './renderText'

class Parser {
  constructor(src, markdown) {
    this.tokens = []
    this.token = null

    this.options = markdown.options
    this.inlineLexer = new InlineLexer(src.links, markdown)

    // use an InlineLexer with a TextRenderer to extract pure text
    const textRenderer = new TextRenderer()
    this.inlineTextLexer = new InlineLexer(src.links, markdown, textRenderer)

    this.blockGrammars = markdown.blockGrammars

    if (!this.blockGrammars.length) {
      throw new Error('Grammars size is zero, at least one grammar required')
    }
  }

  static parse = (src, markdown) => {
    const parser = new Parser(src, markdown);
    return parser.parse(src);
  }

  // src: generated tokens, parse loop
  parse(src) {
    this.tokens = src.reverse();

    let out = ''
    while (this.next()) {
      out += this.tok();
    }

    return out;
  }

  // Get next token
  next() {
    this.token = this.tokens.pop();
    return this.token;
  }

  // Preview next token
  peek() {
    return this.tokens[this.tokens.length - 1] || {};
  }

  // Parse text.
  // Preview next token to check if it's a text content.
  parseText() {
    let body = this.token.text;

    while (this.peek().type === 'text') {
      body += `\n${this.next().text}`
    }

    return this.inlineLexer.output(body);
  }

  // Parse Current Token
  tok() {
    let htmlStr = null

    this.blockGrammars.some((grammar) => {
      htmlStr = grammar.parse(
        this.token, this.inlineLexer,
        this.inlineTextLexer, this.tok.bind(this),
        this.next.bind(this), this.parseText.bind(this),
      )

      return htmlStr || htmlStr === ''
    })

    if (!htmlStr && htmlStr !== '') {
      const errMsg = `Token with "${this.token.type}" type was not found."`

      if (this.options.silent) {
        console.log(errMsg) // eslint-disable-line
        return
      }

      throw new Error(errMsg);
    }

    return htmlStr // eslint-disable-line
  }
}

export default Parser
