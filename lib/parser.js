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

  // next token
  next () {
    this.token = this.tokens.pop();
    return this.token;
  }

  // Parse Current Token
  tok () {
    let htmlStr = null

    this.grammars.some((grammar) => {
      htmlStr = grammar.parse(this.token, this.inlineLexer,
                              this.inlineTextLexer, this.tok.bind(this),
                              this.next.bind(this))
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

    return htmlStr
  }
}

export default Parser
