/**
 * Gfm table
 */

import NpTable, { splitCells } from './nptable'
import { block } from '../../grammar-rules'

class Table extends NpTable {
  constructor(marked) {
    super(marked)

    this.rules = {
      block: block.tables.table,
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
        item.cells[i] = splitCells(
          item.cells[i].replace(/^ *\| *| *\| *$/g, ''),
          item.header.length,
        );
      }

      tokens.push(item);
    }

    return newSrc
  }
}

export default Table
