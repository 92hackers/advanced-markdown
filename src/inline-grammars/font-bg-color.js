/**
 * Custom inline grammar: font-background-color.
 * which support set custom background color to text.
 * Example:
 *
 * Markdown:
 * !!red hello, world!!
 * !!#F9F9F1 hello, world!!
 *
 * Rendered Html:
 * <span style="color: red">hello, world</span>
 * <span style="color: #F9F9F1">hello, world</span>
 */

import {
  inlineStyle,
} from '../utils'

class FontBgColor {
  constructor(marked) {
    this.marked = marked

    this.rules = {
      inline: /^!!!(#[A-Za-z0-9]{6}|[a-zA-Z]{2,10})\s*(.*?)!!!(?!!)/,
    }
  }

  parse(matchedStr) {
    const bgColor = matchedStr[1]
    const text = matchedStr[2]
    return inlineStyle(`background-color: ${bgColor}`, text)
  }
}

export default FontBgColor
