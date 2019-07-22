/**
 * Custom inline grammar: font-size.
 * which support set custom font size to text.
 * Example:
 *
 * Markdown:
 * !30 hello, world!
 *
 * Rendered Html:
 * <span style="font-size: 30px">hello, world</span>
 */

import {
  inlineStyle,
} from '../utils'

class FontSize {
  constructor(marked) {
    this.marked = marked

    this.rules = {
      inline: /^!(\d{1,2})\s*([^!]+?)!/,
    }
  }

  parse(matchedStr) {
    const size = matchedStr[1]
    const text = matchedStr[2]
    return inlineStyle(`font-size: ${size}px`, text)
  }
}

export default FontSize
