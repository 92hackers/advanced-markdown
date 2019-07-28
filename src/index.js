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
import Slugger from './slugger'

import defaultBlockGrammars from './grammars'

class AdvancedMarkdown {
  constructor(options = {}) {
    // Default options.
    this.defaults = getDefaultOptions()
    this.options = this.defaults
    merge(this.options, options)

    // Cache all markdown common and gfm grammars
    this.blockGrammars = defaultBlockGrammars

    // Register custom inline grammars
    this.inlineGrammars = []

    // Init grammars
    this.initGrammars()

    this.Slugger = Slugger
  }

  getDefaults() {
    return this.defaults
  }

  setOptions(opt) {
    // TODO: prevent register grammars in this way
    // if (opt.blockGrammars || opt.inlineGrammars) {
    //   const errMsg = `
    //     grammars should not be registered with setOptions,
    //     there is independent methods to register grammars.
    //   `
    //   throw new Error(errMsg)
    // }

    merge(this.options, opt);
  }

  registerBlockGrammars(grammars = []) {
    if (!Array.isArray(grammars)) {
      throw new Error('Grammars parameter should be an array')
    }

    // Custom grammars should be execute match test firstly.
    this.blockGrammars = [...grammars, ...this.blockGrammars]
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

    const blockGrammars = this.blockGrammars.map(Grammar => instanceGrammar(Grammar))

    const inlineGrammars = this.inlineGrammars.map(Grammar => instanceGrammar(Grammar))

    // Expose all markdown grammars to support customize all grammars behaviours
    this.blockGrammars = blockGrammars
    this.inlineGrammars = inlineGrammars
  }

  parse(src, opt = {}, cb) {
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
      const tokenTypes = Lexer.lex(src, this)
      const outputHtmlStr = Parser.parse(tokenTypes, this);

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
