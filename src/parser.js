/**
 * Parser
 */

import Slugger from './slugger'
import {
  merge,
  getDefaultOptions,
} from './utils'

import Renderer from './render'
import InlineLexer from './inlineLexer'
import TextRenderer from './renderText'

class Parser {
  constructor(options) {
    this.tokens = [];
    this.token = null;
    this.options = options || getDefaultOptions(Renderer)

    this.grammars = this.options.grammars

    if (!this.grammars.length) {
      throw new Error('Grammars size is zero, at least one grammar required')
    }

    this.slugger = new Slugger();
  }

  static parse = (src, options) => {
    const parser = new Parser(options);
    return parser.parse(src);
  }

  // src: generated tokens, parse loop
  parse(src) {
    this.inlineLexer = new InlineLexer(src.links, this.options);
    // use an InlineLexer with a TextRenderer to extract pure text
    this.inlineTextLexer = new InlineLexer(
      src.links,
      merge({}, this.options, { renderer: new TextRenderer() }),
    );
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

    this.grammars.some((grammar) => {
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
