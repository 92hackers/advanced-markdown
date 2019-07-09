/**
 * hr
 */

class Hr {
  constructor(marked) {
    this.options = marked.options

    this.tokenTypes = ['hr']

    this.rules = {
      block: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
    }
  }

  tokenize(cap, src, tokens) {
    tokens.push({
      type: this.tokenTypes[0],
    });
  }

  parse(token) {
    if (!this.tokenTypes.includes(token.type)) {
      return false
    }

    return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
  }
}

export default Hr
