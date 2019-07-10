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
    var lang = (infostring || '').match(/\S*/)[0];

    if (this.options.highlight) {
      const out = this.options.highlight(code, lang);
      if (out != null && out !== code) {
        escaped = true;
        code = out;
      }
    }

    if (!lang) {
      const codeText = escaped ? code : escape(code, true)
      return `<pre><code>${codeText}</code></pre>`
    }

    return '<pre><code class="' +
      this.options.langPrefix +
      escape(lang, true) +
      '">' +
      (escaped ? code : escape(code, true)) +
      '</code></pre>\n';
  }
}

export default Code
