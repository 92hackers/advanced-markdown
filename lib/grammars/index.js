/**
 * Expore all grammars
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
  Heading, Blockquote, Code, Def, Hr,
  Html, LHeading, List, Newline, Paragraph,
  Text, GfmFences, NpTable, Table,
]

export default defaultGrammars
