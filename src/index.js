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

// eslint-disable-next-line
const instanceGrammars = (grammarsArr, markdown) => {
  return grammarsArr.reduce((accum, CurrentGrammar) => {
    const instance = new CurrentGrammar(markdown)

    return {
      grammarsArr: [...accum.grammarsArr, instance],
      grammars: {
        ...accum.grammars,
        [CurrentGrammar.name]: instance,
      },
    }
  }, { grammars: {}, grammarsArr: [] })
}

class AdvancedMarkdown {
  constructor(options = {}) {
    // Default options.
    this.defaults = getDefaultOptions()
    this.options = this.defaults
    merge(this.options, options)

    // Cache all markdown common and gfm grammars
    this._blockGrammarsArr = []
    this._inlineGrammarsArr = []

    // Expose all grammars to outside
    this.blockGrammars = {}
    this.inlineGrammars = {}

    // Init grammars
    this.initGrammars(defaultBlockGrammars)

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

    this.initGrammars(grammars, 'block')
  }

  registerInlineGrammars(grammars = []) {
    if (!Array.isArray(grammars)) {
      throw new Error('Grammars parameter should be an array')
    }

    this.initGrammars(grammars, 'inline')
  }

  initGrammars(grammarsArray = [], type = 'block') {
    const { grammars, grammarsArr } = instanceGrammars(grammarsArray, this)

    switch (type) {
      case 'block':
        this._blockGrammarsArr = [...grammarsArr, ...this._blockGrammarsArr]
        this.blockGrammars = { ...this.blockGrammars, ...grammars }
        break

      case 'inline':
        this._inlineGrammarsArr = [...grammarsArr, ...this._inlineGrammarsArr]
        this.inlineGrammars = { ...this.inlineGrammars, ...grammars }
        break

      default:
        this._blockGrammarsArr = [...grammarsArr, ...this._blockGrammarsArr]
        this.blockGrammars = { ...this.blockGrammars, ...grammars }
    }
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
