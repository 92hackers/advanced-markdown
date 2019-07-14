/*
 * table no leading pipe (gfm)
 *
 */

import { block } from '../../grammar-rules'

export function splitCells(tableRow, count) {
  // ensure that every cell-delimiting pipe has a space
  // before it to distinguish it from an escaped pipe
  const row = tableRow.replace(/\|/g, (match, offset, str) => {
    let escaped = false
    let curr = offset;
    while (--curr >= 0 && str[curr] === '\\') escaped = !escaped;

    // odd number of slashes means | is escaped
    // so we leave it alone
    // add space before unescaped |
    return escaped ? '|' : ' |'
  })

  const cells = row.split(/ \|/)

  if (cells.length > count) {
    cells.splice(count);
  } else {
    while (cells.length < count) cells.push('');
  }

  for (let i = 0; i < cells.length; i++) {
    // leading or trailing whitespace is ignored per the gfm spec
    cells[i] = cells[i].trim().replace(/\\\|/g, '|');
  }

  return cells;
}


class NpTable {
  constructor(marked) {
    this.options = marked.options

    this.tokenTypes = ['table']

    this.rules = {
      block: block.tables.nptable,
    }
  }

  tokenize(cap, src, tokens) {
    const item = {
      type: this.tokenTypes[0],
      header: splitCells(cap[1].replace(/^ *| *\| *$/g, '')),
      align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
      cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : [],
    }

    let newSrc = src

    if (item.header.length === item.align.length) {
      newSrc = src.substring(cap[0].length);

      for (let i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (let i = 0; i < item.cells.length; i++) {
        item.cells[i] = splitCells(item.cells[i], item.header.length);
      }

      tokens.push(item);
    }

    return newSrc
  }

  parse(token, inlineLexer) {
    if (!this.tokenTypes.includes(token.type)) {
      return false
    }

    let header = ''
    let body = ''
    let row = ''
    let cell = ''

    // header
    cell = '';
    for (let i = 0; i < token.header.length; i++) {
      cell += this.renderTableCell(
        inlineLexer.output(token.header[i]),
        {
          header: true,
          align: token.align[i],
        },
      );
    }

    header += this.renderTableRow(cell)

    for (let i = 0; i < token.cells.length; i++) {
      row = token.cells[i];

      cell = '';
      for (let j = 0; j < row.length; j++) {
        cell += this.renderTableCell(
          inlineLexer.output(row[j]),
          {
            header: false,
            align: token.align[j],
          },
        );
      }

      body += this.renderTableRow(cell)
    }

    return this.renderTable(header, body)
  }

  renderTableCell(content, flags) {
    const type = flags.header ? 'th' : 'td';
    const tag = flags.align
      ? '<' + type + ' align="' + flags.align + '">'
      : '<' + type + '>';

    return tag + content + '</' + type + '>\n';
  }

  renderTableRow(content) {
    return '<tr>\n' + content + '</tr>\n';
  }

  renderTable(header, body) {
    let finalBody = body
    if (finalBody) {
      finalBody = '<tbody>' + finalBody + '</tbody>';
    }

    return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + finalBody
    + '</table>\n';
  }
}

export default NpTable
