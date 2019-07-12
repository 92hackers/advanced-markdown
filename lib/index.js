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

import defaultGrammars from './grammars'

class Marked {
  constructor(options = {}) {
    // TODO: 重新在 Marked 初始化时，载入 options, 而不是在 marked 调用的时候。
    //
    // Default options.
    this.defaults = getDefaultOptions(Renderer)
    // Actual options
    this.options = this.defaults

    merge(this.options, options)

    // Cache all markdown available grammars
    this.grammars = defaultGrammars

    // Init grammars
    this.initGrammars()

    // Expose internals
    this.Parser = Parser
    this.parser = Parser.parse

    this.Renderer = Renderer
    this.TextRenderer = TextRenderer

    this.Lexer = Lexer
    this.lexer = src => Lexer.lex(src, this.options)

    this.InlineLexer = InlineLexer
    this.inlineLexer = (src, links) => InlineLexer.output(src, links, this.options)

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
      throw new Error('Grammars parameter should be an array')
    }

    this.grammars = [...this.grammars, ...grammars]
  }

  initGrammars() {
    const grammars = this.grammars.map(Grammar => new Grammar(this))

    // set grammars in options
    this.setOptions({ grammars })
  }

  marked(src, opt = {}, callback) {
    // throw error in case of non string input
    if (typeof src === 'undefined' || src === null) {
      throw new Error('marked(): input parameter is undefined or null');
    }

    if (typeof src !== 'string') {
      throw new Error('marked(): input parameter is of type ' +
        Object.prototype.toString.call(src) + ', string expected');
    }

    const options = merge(this.options, opt)

    if (callback || typeof opt === 'function') {
      if (!callback) {
        callback = opt;
        opt = null;
      }

      var highlight = options.highlight,
        tokens,
        pending,
        i = 0;

      try {
        tokens = Lexer.lex(src, options);
      } catch (e) {
        return callback(e);
      }

      pending = tokens.length;

      const done = function(err) {
        if (err) {
          options.highlight = highlight;
          return callback(err);
        }

        var out;

        try {
          out = Parser.parse(tokens, options);
        } catch (e) {
          err = e;
        }

        options.highlight = highlight;

        return err ?
          callback(err) :
          callback(null, out);
      };

      if (!highlight || highlight.length < 3) {
        return done();
      }

      delete options.highlight;

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
      return Parser.parse(Lexer.lex(src, options), options);
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

export default Marked
