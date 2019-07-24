/**
 * Entry file
 */

import {
  merge,
  escape,
  getDefaultOptions,
} from './utils'

import Lexer from './lexer'
import Parser from './parser'
import TextRenderer from './renderText'
import InlineLexer from './inlineLexer'
import Slugger from './slugger'

import defaultGrammars from './grammars'

import sampleInlineGrammars from './inline-grammars'

class AdvancedMarkdown {
  constructor(options = {}) {
    // Default options.
    this.defaults = getDefaultOptions()

    // Actual options
    this.options = this.defaults

    merge(this.options, options)

    // Cache all markdown available grammars
    this.grammars = defaultGrammars

    // Register custom inline grammars
    this.inlineGrammars = sampleInlineGrammars

    // Init grammars
    this.initGrammars()

    // Expose internals
    this.Parser = Parser
    this.parser = Parser.parse

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

    // Custom grammars should be execute match test firstly.
    this.grammars = [...grammars, ...this.grammars]
    this.initGrammars()
  }

  registerInlineGrammars(grammars = []) {
    if (!Array.isArray(grammars)) {
      throw new Error('Grammars parameter should be an array')
    }

    this.inlineGrammars = [...grammars, ...this.inlineGrammars]
    this.initGrammars()
  }

  initGrammars() {
    // eslint-disable-next-line no-confusing-arrow
    const instanceGrammar = Grammar => typeof Grammar === 'function'
      ? new Grammar(this) : Grammar

    const grammars = this.grammars.map(Grammar => instanceGrammar(Grammar))

    const inlineGrammars = this.inlineGrammars.map(Grammar => instanceGrammar(Grammar))

    // Expose all markdown grammars to support customize all grammars behaviours
    this.grammars = grammars
    this.inlineGrammars = inlineGrammars

    // Set grammars in options
    this.setOptions({ grammars, inlineGrammars })
  }

  marked(src, opt = {}, cb) {
    // throw error in case of non string input
    if (typeof src === 'undefined' || src === null) {
      throw new Error('marked(): input parameter is undefined or null');
    }

    if (typeof src !== 'string') {
      const parmType = Object.prototype.toString.call(src)
      throw new Error(`marked(): input parameter is of type ${parmType}, string expected`)
    }

    // Merge custom options
    if (Object.prototype.toString(opt) === '[object Object]') {
      merge(this.options, opt)
    }

    let callback = cb
    if (callback || typeof opt === 'function') {
      if (!callback) {
        callback = opt;
      }
    }

    try {
      const tokenTypes = Lexer.lex(src, this.options)
      const outputHtmlStr = Parser.parse(tokenTypes, this.options);

      if (callback) {
        callback(null, outputHtmlStr)
      }

      return outputHtmlStr
    } catch (e) {
      e.message += '\nPlease report the problem to https://github.com/92hackers/advanced-markdown\n';
      if (this.options.silent && !callback) {
        return `<p>An error occurred:</p><pre>${escape(e.message, true)}</pre>`
      }

      if (callback) {
        return callback(e)
      }

      throw e;
    }
  }
}

export default AdvancedMarkdown
