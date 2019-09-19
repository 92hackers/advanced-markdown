/**
 * Expose all grammars
 */

import Heading from './heading'
import Blockquote from './blockquote'
import Code from './code'
import Def from './def'
import Hr from './hr'
import Html from './html'
import LHeading from './lheading'
import List from './list'
import Newline from './newline'
import Paragraph from './paragraph'
import Text from './text'

// gfm
import GfmFences from './gfm/fences'
import NpTable from './gfm/nptable'
import Table from './gfm/table'

const defaultGrammars = [
  Newline, Code, GfmFences, Heading,
  NpTable, Hr, Blockquote, List,
  Html, Def, Table, LHeading, Paragraph,
  Text,
]

export default defaultGrammars
