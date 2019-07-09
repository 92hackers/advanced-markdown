/**
 * html
 */

class Html {
  constructor(marked) {
    this.options = marked.options

    this.tokenTypes = ['html']

    this.rules = {
      block: '^ {0,3}(?:' // optional indentation
      + '<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
      + '|comment[^\\n]*(\\n+|$)' // (2)
      + '|<\\?[\\s\\S]*?\\?>\\n*' // (3)
      + '|<![A-Z][\\s\\S]*?>\\n*' // (4)
      + '|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>\\n*' // (5)
      + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)' // (6)
      + '|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) open tag
      + '|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) closing tag
      + ')',
    }
  }

  tokenize(cap, src, tokens) {
    const { sanitizer } = this.options

    tokens.push({
      type: this.tokenTypes[0],
      pre: !sanitizer && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
      text: cap[0],
    })
  }

  parse(token) {
    if (!this.tokenTypes.includes(token.type)) {
      return false
    }

    return token.text
  }
}

export default Html
