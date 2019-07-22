/**
 * Helper functions
 */

export function escape(html, encode) {
  const escapeTest = /[&<>"']/;
  const escapeReplace = /[&<>"']/g;
  const replacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  const escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
  const escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;

  if (encode) {
    if (escapeTest.test(html)) {
      return html.replace(escapeReplace, ch => replacements[ch])
    }
  } else if (escapeTestNoEncode.test(html)) {
    return html.replace(escapeReplaceNoEncode, ch => replacements[ch])
  }

  return html;
}

export function unescape(html) {
  // explicitly match decimal, hex, and named HTML entities
  return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig, (_, char) => {
    const n = char.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }

    return '';
  });
}

export function cleanUrl(sanitize, base, srcHref) {
  const originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;
  let href = srcHref

  if (sanitize) {
    let prot = ''
    try {
      prot = decodeURIComponent(unescape(href)).replace(/[^\w:]/g, '').toLowerCase();
    } catch (e) {
      return null;
    }

    const nonUrlSrcs = ['javascript:', 'vbscript:', 'data:'] // eslint-disable-line

    let isNonUrl = false
    nonUrlSrcs.some((src) => {
      isNonUrl = prot.includes(src)
      return isNonUrl
    })

    if (isNonUrl) {
      return null
    }
  }

  if (base && !originIndependentUrl.test(href)) {
    href = resolveUrl(base, href)();  // eslint-disable-line
  }

  try {
    href = encodeURI(href).replace(/%25/g, '%');
  } catch (e) {
    return null;
  }

  return href;
}

export function edit(srcRegex, srcOpt) {
  let regex = srcRegex.source || srcRegex;
  const opt = srcOpt || '';

  return {
    replace: function replace(name, srcVal) {
      let val = srcVal.source || srcVal;
      val = val.replace(/(^|[^\[])\^/g, '$1');
      regex = regex.replace(name, val);
      return this;
    },
    getRegex: () => new RegExp(regex, opt),
  };
}

export function resolveUrl(base, href) {
  const baseUrls = {};

  const key = ` ${base}`

  return () => {
    if (!baseUrls[key]) {
      // we can ignore everything in base after the last slash of its path component,
      // but we might need to add _that_
      // https://tools.ietf.org/html/rfc3986#section-3
      if (/^[^:]+:\/*[^/]*$/.test(base)) {
        baseUrls[key] = `${base}/`
      } else {
        baseUrls[key] = rtrim(base, '/', true); // eslint-disable-line
      }
    }

    base = baseUrls[key]; // eslint-disable-line no-param-reassign

    if (href.slice(0, 2) === '//') {
      return base.replace(/:[\s\S]*/, ':') + href;
    }

    if (href.charAt(0) === '/') {
      return base.replace(/(:\/*[^/]*)[\s\S]*/, '$1') + href;
    }

    return base + href
  }
}

export function noop() {}
noop.exec = noop;

export function merge(obj, ...rest) {
  for (let i = 0; i < rest.length; i++) {
    const target = rest[i];
    Object.keys(target).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key]; // eslint-disable-line no-param-reassign
      }
    })
  }

  return obj;
}

// Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
// /c*$/ is vulnerable to REDOS.
// invert: Remove suffix of non-c chars instead. Default falsey.
export function rtrim(str, c, invert) {
  if (str.length === 0) {
    return '';
  }

  // Length of suffix matching the invert condition.
  let suffLen = 0;

  // Step left until we fail to match the invert condition.
  while (suffLen < str.length) {
    const currChar = str.charAt(str.length - suffLen - 1);
    if (currChar === c && !invert) {
      suffLen++;
    } else if (currChar !== c && invert) {
      suffLen++;
    } else {
      break;
    }
  }

  return str.substr(0, str.length - suffLen);
}

export function getDefaultOptions() {
  return {
    baseUrl: null,
    breaks: false,
    gfm: true,
    headerIds: true,
    headerPrefix: '',
    highlight: null,
    langPrefix: 'language-',
    mangle: true,
    pedantic: false,
    sanitize: false,
    sanitizer: null,
    silent: false,
    smartLists: false,
    smartypants: false,
    tables: true,
    xhtml: false,
    grammars: [],
  };
}

// Attach suctom styles to inline text
export function inlineStyle(styleStr, text) {
  return `<span style="${styleStr}">${text}</span>`
}
