/**
 * Parser
 */

import Slugger from './slugger'
import {
  merge,
  getDefaultOptions,
  unescape,
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

    this.options.renderer = this.options.renderer || new Renderer();
    this.renderer = this.options.renderer;
    this.renderer.options = this.options;
    this.slugger = new Slugger();
  }

  static parse = function(src, options) {
    var parser = new Parser(options);
    return parser.parse(src);
  }

  // parse loop
  parse(src) {
    this.inline = new InlineLexer(src.links, this.options);
    // use an InlineLexer with a TextRenderer to extract pure text
    this.inlineText = new InlineLexer(
      src.links,
      merge({}, this.options, { renderer: new TextRenderer() })
    );
    this.tokens = src.reverse();

    var out = '';
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

  // preview next token
  peek() {
    return this.tokens[this.tokens.length - 1] || 0;
  }

  parseText() {
    var body = this.token.text;

    while (this.peek().type === 'text') {
      body += '\n' + this.next().text;
    }

    return this.inline.output(body);
  }

  // Parse Current Token
  tok = () => {
    let htmlStr = ''

    this.grammars.some((grammar) => {
      htmlStr = grammar.parse(this.token, this.inline, this.inlineText, this.tok, this.next)
      return htmlStr
    })

    if (!htmlStr) {
      var errMsg = 'Token with "' + this.token.type + '" type was not found.';

      if (this.options.silent) {
        console.log(errMsg);
      } else {
        throw new Error(errMsg);
      }
    }

    return htmlStr

    // Remove below codes.

    switch (this.token.type) {

      case 'list_start': {
        body = '';
        var ordered = this.token.ordered,
          start = this.token.start;

        while (this.next().type !== 'list_end') {
          body += this.tok();
        }

        return this.renderer.list(body, ordered, start);
      }
      case 'list_item_start': {
        body = '';
        var loose = this.token.loose;
        var checked = this.token.checked;
        var task = this.token.task;

        if (this.token.task) {
          body += this.renderer.checkbox(checked);
        }

        while (this.next().type !== 'list_item_end') {
          body += !loose && this.token.type === 'text' ?
            this.parseText() :
            this.tok();
        }
        return this.renderer.listitem(body, task, checked);
      }
      case 'paragraph': {
        return this.renderer.paragraph(this.inline.output(this.token.text));
      }
      case 'text': {
        return this.renderer.paragraph(this.parseText());
      }
    }
  }
}

export default Parser
