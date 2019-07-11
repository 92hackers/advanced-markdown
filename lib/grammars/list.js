/**
 * List
 */

import { block } from '../grammar-rules'

class List {
  constructor(marked) {
    this.options = marked.options

    this.startTokenTypes = ['list_start', 'list_item_start']
    this.endTokenTypes = ['list_end', 'list_item_end']

    this.itemRule = block.item
    this.rules = {
      block: block.list,
    }
  }

  tokenize(cap, src, tokens, tokenFunc) {
    let newSrc = ''
    const bull = cap[2];
    const isordered = bull.length > 1;

    const listStart = {
      type: this.startTokenTypes[0],
      ordered: isordered,
      start: isordered ? +bull : '',
      loose: false,
    }

    tokens.push(listStart);

    // Get each top-level item.
    const itemCap = cap[0].match(this.itemRule)
    const capSize = itemCap.length;

    const listItems = [];
    let next = false;

    for (let i = 0; i < capSize; i++) {
      let item = itemCap[i]

      // Remove the list item's bullet
      // so it is seen as the next token.
      let space = item.length;
      item = item.replace(/^ *([*+-]|\d+\.) */, '');

      // Outdent whatever the
      // list item contains. Hacky.
      if (item.includes('\n ')) {
        space -= item.length;
        item = !this.options.pedantic ?
          item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '') :
          item.replace(/^ {1,4}/gm, '');
      }

      // Determine whether the next list item belongs here.
      // Backpedal if it does not belong in this list.
      if (i !== capSize - 1) {
        const bulletMatch = block.bullet.exec(itemCap[i + 1])[0];

        if (bull.length > 1 ? bulletMatch.length === 1 :
          (bulletMatch.length > 1 || (this.options.smartLists && bulletMatch !== bull))) {
          newSrc = itemCap.slice(i + 1).join('\n') + src;
          i = capSize - 1;
        }
      }

      // Determine whether item is loose or not.
      // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/ for discount behavior.
      let loose = next || /\n\n(?!\s*$)/.test(item);
      if (i !== capSize - 1) {
        next = item.charAt(item.length - 1) === '\n';

        if (!loose) {
          loose = next
        }
      }

      if (loose) {
        listStart.loose = true;
      }

      // Check for task list items
      const istask = /^\[[ xX]\] /.test(item);
      let ischecked = undefined;

      if (istask) {
        ischecked = item[1] !== ' ';
        item = item.replace(/^\[[ xX]\] +/, '');
      }

      const listItem = {
        type: this.startTokenTypes[1],
        task: istask,
        checked: ischecked,
        loose,
      }

      listItems.push(listItem)
      tokens.push(listItem)

      // Recurse.
      tokenFunc(item, false);

      tokens.push({
        type: this.endTokenTypes[1],
      })
    }


    if (listStart.loose) {
      const listSize = listItems.length;
      for (let i = 0; i < listSize; i++) {
        listItems[i].loose = true;
      }
    }

    tokens.push({ type: this.endTokenTypes[0] })

    return newSrc
  }

  parse(token, inline, inlineText, tokFunc, nextFunc) {
    const {
      type, ordered, start, loose, checked, task, text,
    } = token

    if (!this.startTokenTypes.includes(type)) {
      return false
    }

    if (type === this.startTokenTypes[0]) { // list
      let body = ''
      while (nextFunc().type !== this.endTokenTypes[0]) {
        body += tokFunc();
      }
      return this.renderList(body, ordered, start);
    }

    if (type === this.startTokenTypes[1]) { // list item
      let body = ''
      if (task) {
        body += this.renderCheckbox(checked);
      }

      // Preview next token
      let nextToken = nextFunc()
      while (nextToken.type !== this.endTokenTypes[1]) {
        body += !loose && nextToken.type === 'text'
          ? `${inline.output(nextToken.text)}\n` : tokFunc();
        nextToken = nextFunc()
      }
      return this.renderListItem(body, task, checked);
    }

    return false
  }

  renderList(body, ordered, start) {
    const type = ordered ? 'ol' : 'ul'
    const startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';

    return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
  }

  renderListItem(text) {
    return '<li>' + text + '</li>\n';
  }

  renderCheckbox(checked) {
    return '<input ' +
      (checked ? 'checked="" ' : '') +
      'disabled="" type="checkbox"' +
      (this.options.xhtml ? ' /' : '') +
      '> ';
  }
}

export default List
