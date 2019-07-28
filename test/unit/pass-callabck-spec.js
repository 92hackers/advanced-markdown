const Marked = require('../../dist');

describe('Test pass callback into marked: ', () => {
  it('should call the callback with parsed html string', () => {
    const marked = new Marked()
    const expectEdStr = '<h1 id="header">Header</h1>\n'

    const cb = (err, htmlstr) => {
      expect(err).toBe(null)
      expect(htmlstr).toBe(expectEdStr)
    }

    const md = '# Header'

    // pass parameters: src, callback
    const parsedHtml = marked.parse(md, cb)

    expect(parsedHtml).toBe(expectEdStr)

    // pass parameters: src, options, callback
    const anotherHtml = marked.parse(md, { highlight: () => {} }, cb)

    expect(anotherHtml).toBe(expectEdStr)
  })
})
