@import "./arguments.pegjs" as Arguments
@import "./command-symbol.pegjs" as CommandSymbol

// a command is a character followed by 0-n arguments; the join is to handle
// emojis which otherwise appear as two separate Unicode characters
Command
  = c:CommandSymbol a:Arguments?
  {return {command: c, args: a || []}}
