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

  link(srcHref, title, text) {
    const href = cleanUrl(this.options.sanitize, this.options.baseUrl, srcHref);
    if (href === null) {
      return text;
    }

    let out = '<a href="' + escape(href) + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += '>' + text + '</a>';

    return out;
  }

  image(srcHref, title, text) {
    const href = cleanUrl(this.options.sanitize, this.options.baseUrl, srcHref);
    if (href === null) {
      return text;
    }

    let out = '<img src="' + href + '" alt="' + text + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += this.options.xhtml ? '/>' : '>';

    return out;
  }

  text(text) {
    return text;
  }
}

export default Renderer
