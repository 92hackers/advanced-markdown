/**
 * Lib entry
 */

import {
  merge,
  escape,
  getDefaultOptions,
} from './utils'

import Lexer from './lexer'
import Parser from './parser'
import Renderer from './render'
import TextRenderer from './renderText'
import InlineLexer from './inlineLexer'
import Slugger from './slugger'

import {
  code,
} from './grammars'

class Marked {
  constructor(options) {
    // TODO: 重新在 Marked 初始化时，载入 options, 而不是在 marked 调用的时候。
    //
    // Default options.
    this.defaults = getDefaultOptions(Renderer)

    // Cache all markdown available grammars
    // TODO: set default grammars, based on options.
    this.grammars = []

    // Actual options
    this.options = this.defaults

    // Expose internals
    this.Parser = Parser
    this.parser = Parser.parse

    this.Renderer = Renderer
    this.TextRenderer = TextRenderer

    this.Lexer = Lexer
    this.lexer = Lexer.lex

    this.InlineLexer = InlineLexer
    this.inlineLexer = InlineLexer.output

    this.Slugger = Slugger

    this.parse = this
  }

  getDefaults() {
    return this.defaults
  }

  setOptions(opt) {
    merge(this.options, opt);
    return this.marked
  }

  registerCustomGrammar(grammars = []) {
    if (!Array.isArray(grammars)) {
      throw new Error('grammars parameter should be an array')
    }

    this.grammars = [...this.grammars, ...grammars]
  }

  initGrammars() {
    const grammars = this.grammars.map(Grammar => new Grammar(this))

    // set grammars in options
    this.setOptions({ grammars })
  }

  marked(src, opt, callback) {
    // throw error in case of non string input
    if (typeof src === 'undefined' || src === null) {
      throw new Error('marked(): input parameter is undefined or null');
    }
    if (typeof src !== 'string') {
      throw new Error('marked(): input parameter is of type ' +
        Object.prototype.toString.call(src) + ', string expected');
    }

    if (callback || typeof opt === 'function') {
      if (!callback) {
        callback = opt;
        opt = null;
      }

      this.initGrammars()

      opt = merge({}, this.options, opt || {});

      var highlight = opt.highlight,
        tokens,
        pending,
        i = 0;

      try {
        tokens = Lexer.lex(src, opt);
      } catch (e) {
        return callback(e);
      }

      pending = tokens.length;

      var done = function(err) {
        if (err) {
          opt.highlight = highlight;
          return callback(err);
        }

        var out;

        try {
          out = Parser.parse(tokens, opt);
        } catch (e) {
          err = e;
        }

        opt.highlight = highlight;

        return err ?
          callback(err) :
          callback(null, out);
      };

      if (!highlight || highlight.length < 3) {
        return done();
      }

      delete opt.highlight;

      if (!pending) return done();

      for (; i < tokens.length; i++) {
        (function(token) {
          if (token.type !== 'code') {
            return --pending || done();
          }
          return highlight(token.text, token.lang, function(err, code) {
            if (err) return done(err);
            if (code == null || code === token.text) {
              return --pending || done();
            }
            token.text = code;
            token.escaped = true;
            --pending || done();
          });
        })(tokens[i]);
      }

      return;
    }
    try {
      if (opt) opt = merge({}, this.options, opt);
      return Parser.parse(Lexer.lex(src, opt), opt);
    } catch (e) {
      e.message += '\nPlease report this to https://github.com/markedjs/marked.';
      if ((opt || this.options).silent) {
        return '<p>An error occurred:</p><pre>' +
          escape(e.message + '', true) +
          '</pre>';
      }
      throw e;
    }
  }
}

const marked = new Marked()

export default marked
