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

  // parse loop
  parse(src) {
    this.inline = new InlineLexer(src.links, this.options);
    // use an InlineLexer with a TextRenderer to extract pure text
    this.inlineText = new InlineLexer(
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
  next = () => {
    this.token = this.tokens.pop();
    return this.token;
  }

  // Parse Current Token
  tok = () => {
    let htmlStr = ''

    this.grammars.some((grammar) => {
      htmlStr = grammar.parse(this.token, this.inline, this.inlineText, this.tok, this.next)
      return htmlStr
    })

    if (!htmlStr) {
      const errMsg = `Token with "${this.token.type}" type was not found."`

      if (this.options.silent) {
        console.log(errMsg) // eslint-disable-line
      } else {
        throw new Error(errMsg);
      }
    }

    return htmlStr
  }
}

export default Parser
