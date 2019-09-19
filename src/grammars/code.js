/**
 * Markdown code grammar:
 * // TODO: grammar example.
 */

import {
  rtrim,
  escape,
} from '../utils'

import { block, inline } from '../grammar-rules'

class Code {
  constructor(marked) {
    this.options = marked.options

    this.tokenTypes = ['code']

    this.rules = {
      block: block.code,
      inline: inline.code,
    }
  }

  // cap = rule.exec(src)
  tokenize(cap, src, tokens) {
    const lastToken = tokens[tokens.length - 1];

    // An indented code block cannot interrupt a paragraph.
    if (lastToken && lastToken.type === 'paragraph') {
      lastToken.text += `\n ${cap[0].trimRight()}`
    } else {
      const text = cap[0].replace(/^ {4}/gm, '');

      tokens.push({
        type: this.tokenTypes[0],
        codeBlockStyle: 'indented',
        text: !this.options.pedantic ? rtrim(text, '\n') : text,
      })
    }
  }

  parse(token) {
    if (!this.tokenTypes.includes(token.type)) {
      return false
    }

    const { text, lang, escaped } = token
    return this.renderHtmlStr(text, lang, escaped)
  }

  renderHtmlStr(code, infostring, escaped) {
    const lang = (infostring || '').match(/\S*/)[0];
    const { highlight, langPrefix } = this.options

    const languageClass = lang ? ` class="${langPrefix + escape(lang, true)}"` : ''
    const paddingNewLine = lang ? '\n' : ''
    let isEscaped = escaped
    let codeText = code

    if (highlight && typeof highlight === 'function') {
      const out = highlight(code, lang);
      if (out != null && out !== code) {
        isEscaped = true;
        codeText = out;
      }
    }

    codeText = isEscaped ? codeText : escape(codeText, true)
    return `<pre><code${languageClass}>${codeText}</code></pre>${paddingNewLine}`
  }
}

export default Code
