/**
 * Renderer, convert token sets into html strings.
 */

import {
  escape,
  getDefaultOptions,
  cleanUrl,
} from './utils'

class Renderer {
  constructor(options) {
    this.options = options || getDefaultOptions()
  }

  code(code, infostring, escaped) {
  }

  hr() {
  }

  list() {
  }

  listitem(text) {
  }

  checkbox(checked) {
    return '<input ' +
      (checked ? 'checked="" ' : '') +
      'disabled="" type="checkbox"' +
      (this.options.xhtml ? ' /' : '') +
      '> ';
  }

  paragraph(text) {
    return '<p>' + text + '</p>\n';
  }

  table(header, body) {
  }

  // span level renderer
  strong(text) {
    return '<strong>' + text + '</strong>';
  }

  em(text) {
    return '<em>' + text + '</em>';
  }

  codespan(text) {
    return '<code>' + text + '</code>';
  }

  br() {
    return this.options.xhtml ? '<br/>' : '<br>';
  }

  del(text) {
    return '<del>' + text + '</del>';
  }

  link(href, title, text) {
    href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
    if (href === null) {
      return text;
    }
    var out = '<a href="' + escape(href) + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += '>' + text + '</a>';
    return out;
  }

  image(href, title, text) {
    href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
    if (href === null) {
      return text;
    }

    var out = '<img src="' + href + '" alt="' + text + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += this.options.xhtml ? '/>' : '>';
    return out;
  }

  text(text) {
    return text;
  }

  inlineStyle(styleStr, text) {
    return `<span style="${styleStr}">${text}</span>`
  }

  fontColor(color, text) {
    return this.inlineStyle(`color: ${color}`, text)
  }

  fontBgColor(color, text) {
    return this.inlineStyle(`background-color: ${color}`, text)
  }
}

export default Renderer
