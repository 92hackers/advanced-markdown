const hljs = require('highlight.js') // eslint-disable-line

const Marked = require('../../dist');

describe('Test highlight code blcoks:', () => {
  const md = '```javascript\nvar a = function () { console.log("hello, world") }\n```'

  it('should highlight code when set `highlight` option', () => {
    const marked = new Marked({
      highlight: code => hljs.highlightAuto(code).value,
    })

    const html = marked.marked(md)
    const expectedHtml = '<pre><code class="language-javascript"><span class="hljs-keyword">var</span> a = <span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params"></span>) </span>{ <span class="hljs-built_in">console</span>.log(<span class="hljs-string">"hello, world"</span>) }</code></pre>\n'

    expect(html).toBe(expectedHtml)
  })

  it('should not highlight code when not set `highlight` option', () => {
    const marked = new Marked()

    const html = marked.marked(md)
    const expectedHtml = '<pre><code class="language-javascript">var a = function () { console.log(&quot;hello, world&quot;) }</code></pre>\n'

    expect(html).toBe(expectedHtml)
  })
})
