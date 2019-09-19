/**
 * Text renderer
 */

class TextRenderer {
  strong(text) {
    return text
  }

  em(text) {
    return text
  }

  codespan(text) {
    return text
  }

  del(text) {
    return text
  }

  text(text) {
    return text
  }

  image(href, title, text) {
    return text.toString()
  }

  link(href, title, text) {
    return text.toString()
  }

  br() {
    return ''
  }
}

export default TextRenderer
